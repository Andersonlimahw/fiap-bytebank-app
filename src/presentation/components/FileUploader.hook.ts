// picker.ts
import * as DocumentPicker from "expo-document-picker";
import storage, { TaskState } from "@react-native-firebase/storage";
import { ensureMediaPermissions } from "@utils/permissions";

type PickAndStageResult = {
  name: string;
  mime?: string | null;
  localUri: string; // file://...
};

export async function pickAndStageOne(): Promise<PickAndStageResult> {
  // 1) escolher arquivo usando expo-document-picker
  const result = await DocumentPicker.getDocumentAsync({
    multiple: false,
    type: ["image/*"],
    copyToCacheDirectory: true, // Copia automaticamente para cache
  });

  if (result.canceled) {
    throw new Error("Operação cancelada pelo usuário");
  }

  const doc = result.assets[0];

  return {
    name: doc.name ?? "arquivo",
    mime: doc.mimeType ?? null,
    localUri: doc.uri, // expo-document-picker já retorna URI estável
  };
}

export async function uploadToFirebase(userId: string, transactionId: string) {
  let loading = true;

  try {
    const { name, mime, localUri } = await pickAndStageOne();
    console.log("uploadToFirebase Init with params -> ", {
      name,
      mime,
      localUri,
      userId,
      transactionId,
    });

    // 3) montar path final no bucket
    // Sanitize fileName to avoid Firebase Storage issues
    const sanitizedFileName = name
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');

    const objectPath = `bytebank-files/users/${userId}/transactions/${transactionId}/${sanitizedFileName}`;

    // 4) RNFirebase espera caminho de arquivo local (na prática, remover o prefixo file:// é mais seguro)
    const filePath = localUri.startsWith('file://') ? localUri.replace('file://', '') : localUri;

    // 5) subir com putFile (namespaced API atual)
    const task = storage()
      .ref(objectPath)
      .putFile(filePath, {
        contentType: mime ?? undefined,
      });

    // Progress tracking
    task.on(
      "state_changed",
      (taskSnapshot) => {
        const progress = (taskSnapshot.bytesTransferred / taskSnapshot.totalBytes) * 100;
        console.log(`uploadToFirebase: progress ${progress.toFixed(2)}%`);

        switch (taskSnapshot.state) {
          case TaskState.RUNNING:
            console.log(`Upload is running: ${progress.toFixed(2)}%`);
            break;
          case TaskState.PAUSED:
            console.log("Upload is paused.");
            break;
          case TaskState.CANCELLED:
            console.log("Upload was canceled");
            break;
          case TaskState.ERROR:
            console.log("Upload error occurred");
            break;
          case TaskState.SUCCESS:
            console.log("Upload completed successfully");
            break;
        }
      },
      (error) => {
        console.error("Error on uploadToFirebase -> ", error);
        loading = false;
        throw error;
      }
    );

    // Wait for upload completion
    const uploadResult = await task;

    // Get download URL from the storage reference
    const storageRef = storage().ref(objectPath);
    const downloadUrl = await storageRef.getDownloadURL();

    loading = false;

    const resultFile = {
      name,
      mime,
      localUri,
      objectPath,
      downloadUrl
    };

    console.log("uploadToFirebase completed successfully -> ", resultFile);
    return { file: resultFile, loading };

  } catch (error) {
    loading = false;
    console.error("uploadToFirebase failed -> ", error);
    throw error;
  }
}

export const useFileUploader = () => {
  return {
    pickAndStageOne,
    uploadToFirebase,
    ensureMediaPermissions,
  };
};
