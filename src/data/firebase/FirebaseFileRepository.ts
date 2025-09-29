import { Platform } from "react-native";
import storage, { TaskState } from "@react-native-firebase/storage";
import type { File } from "@domain/entities/File";
import {
  FileRepository,
  UploadFileInput,
  ListByTransactionInput,
} from "@app/domain/repositories/FileRepository";
import { cacheDirectory, makeDirectoryAsync, copyAsync, getInfoAsync } from "expo-file-system/legacy";

type GetFilePathInput = {
  userId: string;
  transactionId: string;
  fileName: string; // passe "" quando quiser o prefixo da pasta
};

export function getFilePath({
  userId,
  transactionId,
  fileName,
}: GetFilePathInput) {
  const tx = transactionId || Date.now().toString();
  // use directories (no leading slash)
  const base = `bytebank-files/users/${userId}/transactions/${tx}`;
  // when fileName === "" return only the directory prefix
  return fileName ? `${base}/${fileName}` : base;
}

export async function pingStorage(): Promise<boolean> {
  try {
    const ref = storage().refFromURL(
      "gs://projeto-bytebank.firebasestorage.app/__health/ping.txt"
    );
    await ref.putString("ok"); // smoke-test
    return true;
  } catch (error) {
    console.error("pingStorage failed:", error);
    return false;
  }
}

async function ensureLocalReadableFile(
  uri: string,
  targetFileName: string
): Promise<string> {
  try {
    console.log("ensureLocalReadableFile input:", { uri, targetFileName, platform: Platform.OS });

    // For iOS, handle temporary locations that might become inaccessible
    if (Platform.OS === "ios" && uri.startsWith("file://")) {
      const lower = uri.toLowerCase();
      const isInbox = lower.includes("/tmp/com.") && lower.includes("-inbox/");
      const isTmp = lower.includes("/tmp/");

      if (isInbox || isTmp) {
        console.log("iOS: Copying from temporary location to cache");
        const dir = `${cacheDirectory}uploads/`;
        await makeDirectoryAsync(dir, { intermediates: true }).catch(
          () => undefined
        );
        const dest = `${dir}${Date.now()}-${targetFileName}`;

        // Copy to our cache so RNFirebase can read it reliably
        await copyAsync({ from: uri, to: dest });
        console.log("iOS: File copied to:", dest);
        return dest;
      }
    }

    // For Android and other cases, use the URI as-is but log it
    console.log("Using original URI:", uri);
    return uri;
  } catch (error) {
    console.error("Error in ensureLocalReadableFile:", error);
    // If anything fails, fall back to original
    console.log("Falling back to original URI:", uri);
    return uri;
  }
}

export class FirebaseFileRepository implements FileRepository {
  async upload(input: UploadFileInput): Promise<File> {
    console.log("FirebaseFileRepository.upload started with input:", input);

    try {
      const { userId, transactionId, fileUri, mimeType: mime, fileName } = input;

      if (!userId || !transactionId || !fileUri) {
        throw new Error(`Missing required parameters: userId=${userId}, transactionId=${transactionId}, fileUri=${fileUri}`);
      }

    const localUri = await ensureLocalReadableFile(fileUri, fileName || "file");

    // Sanitize fileName to avoid Firebase Storage issues
    const sanitizedFileName = (fileName || 'file')
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');

    const objectPath = `bytebank-files/users/${userId}/transactions/${transactionId}/${sanitizedFileName}`;

    // Prepare file path for putFile - RNFirebase expects local file path without file:// prefix
    let filePath = localUri;
    if (Platform.OS === "ios" && localUri.startsWith('file://')) {
      filePath = localUri.replace('file://', '');
    } else if (Platform.OS === "android") {
      // Android URIs from expo-document-picker should work as-is
      filePath = localUri;
    }

    console.log("FirebaseFileRepository.upload paths:", {
      objectPath,
      filePath,
      localUri,
      platform: Platform.OS
    });

    // Verify file exists before uploading
    try {
      const fileInfo = await getInfoAsync(filePath);
      console.log("File info:", fileInfo);

      if (!fileInfo.exists) {
        throw new Error(`File does not exist at path: ${filePath}`);
      }
    } catch (fileCheckError) {
      console.error("Error checking file existence:", fileCheckError);
      throw new Error(`Cannot access file at path: ${filePath}. Error: ${fileCheckError}`);
    }

    const task = storage()
      .ref(objectPath)
      .putFile(filePath, {
        contentType: mime ?? undefined,
      });

    // (opcional) progresso
    task.on("state_changed",
      (taskSnapshot) => {
        const progress = (taskSnapshot.bytesTransferred / taskSnapshot.totalBytes) * 100;
        console.log(`FirebaseFileRepository upload progress: ${progress.toFixed(2)}%`);

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
            console.error("Upload error occurred in state_changed");
            break;
          case TaskState.SUCCESS:
            console.log("Upload completed successfully");
            break;
        }
      },
      (error) => {
        console.error("FirebaseFileRepository upload error:", {
          code: error.code,
          message: error.message,
          nativeErrorCode: error.nativeErrorCode,
          nativeErrorMessage: error.nativeErrorMessage,
          objectPath,
          filePath,
          platform: Platform.OS
        });

        // More specific error handling
        if (error.code === 'storage/object-not-found') {
          throw new Error(`Firebase Storage: File path not accessible. Check file permissions and authentication. Path: ${objectPath}`);
        } else if (error.code === 'storage/unauthorized') {
          throw new Error('Firebase Storage: Unauthorized access. Check Firebase Storage rules and user authentication.');
        } else if (error.code === 'storage/canceled') {
          throw new Error('Upload was canceled by user or system.');
        } else {
          throw new Error(`Firebase Storage upload failed: ${error.message} (Code: ${error.code})`);
        }
      }
    );

    // Await upload completion
    const uploadResult = await task;

      // Get download URL from the storage reference
      const storageRef = storage().ref(objectPath);
      const downloadUrl = await storageRef.getDownloadURL();
      const resultFile: File = {
        id: downloadUrl,
        userId,
        transactionId,
        downloadUrl,
        sizeInBytes: 0,
        mimeType: mime || "application/octet-stream",
        createdAt: Date.now(),
      };

      console.log("FirebaseFileRepository.upload completed successfully:", {
        fileName: sanitizedFileName,
        downloadUrl,
        objectPath
      });

      return resultFile;
    } catch (error: any) {
      console.error("FirebaseFileRepository.upload failed:", {
        error: error.message,
        code: error.code,
        input,
        platform: Platform.OS
      });
      throw error;
    }
  }

  async listByTransaction(userId: string, transactionId: string): Promise<File[]> {
    try {
      const prefix = getFilePath({
        userId,
        transactionId,
        fileName: "",
      });
      const dirRef = storage().ref(prefix);
      let listResult;
      try {
        listResult = await dirRef.listAll();
      } catch (e: any) {
        // When the prefix doesn't exist yet, RNFirebase may throw object-not-found.
        if (String(e?.code).includes("object-not-found")) {
          return [];
        }
        throw e;
      }

      const files: File[] = [];
      for (const item of listResult.items) {
        const metadata = await item.getMetadata();
        const downloadUrl = await item.getDownloadURL();

        files.push({
          id: item.fullPath,
          userId,
          transactionId,
          downloadUrl,
          sizeInBytes: (metadata as any)?.size ?? 0,
          mimeType:
            (metadata as any)?.contentType ?? "application/octet-stream",
          createdAt: (metadata as any)?.timeCreated
            ? new Date((metadata as any).timeCreated).getTime()
            : Date.now(),
        });
      }
      return files;
    } catch (error) {
      console.error("Error listing files:", error);
      throw new Error("Error listing files: " + error);
    }
  }
  async delete(file: File): Promise<void> {
    try {
      await storage().ref(file.id).delete();
    } catch (error) {
      console.error("Error removing files:", error);
      throw new Error("Error removing files: " + error);
    }
  }
  async getDownloadUrl(file: File): Promise<string> {
    return await storage().ref(file.id).getDownloadURL();
  }
}
