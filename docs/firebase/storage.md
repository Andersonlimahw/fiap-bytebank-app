# Firebase Storage (`@react-native-firebase/storage`)

Use este guia para adicionar upload e download de arquivos no ByteBank preservando a separação de camadas. No exemplo a seguir criaremos um fluxo de comprovantes de transação (`Files`).

## 1. Instalação

```sh
npm install @react-native-firebase/storage
npx expo prebuild --clean
cd ios && pod install
```

No Firebase Console habilite o Storage e configure as regras (por exemplo, restringindo acesso a `/files/{userId}/`).

## 2. Camada Domain

1. Entidade (`src/domain/entities/File.ts`):

   ```ts
   export interface File {
     id: string;
     userId: string;
     transactionId: string;
     downloadUrl: string;
     sizeInBytes: number;
     mimeType: string;
     createdAt: number;
   }
   ```

2. Repositório (`src/domain/repositories/FileRepository.ts`):

   ```ts
   export interface FileRepository {
     upload(params: {
       userId: string;
       transactionId: string;
       fileUri: string;
       mimeType?: string;
     }): Promise<File>;
     listByTransaction(userId: string, transactionId: string): Promise<File[]>;
     remove(file: File): Promise<void>;
     getDownloadUrl(file: File): Promise<string>;
   }
   ```

3. Token DI (`src/core/di/container.tsx`):
   ```ts
   FileRepository: Symbol('FileRepository') as Token<FileRepository>,
   ```

## 3. Camada Data (Firebase)

Crie `src/data/firebase/FirebaseFileRepository.ts`:

```ts
import { Platform } from "react-native";
import storage from "@react-native-firebase/storage";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
} from "@react-native-firebase/storage";
import type { FileRepository } from "@domain/repositories/FileRepository";
import type { File } from "@domain/entities/File";
import { FirebaseAPI } from "../../infrastructure/firebase/firebase";

function filePath(userId: string, transactionId: string, filename: string) {
  return `files/${userId}/${transactionId}/${filename}`;
}

export class FirebaseFileRepository implements FileRepository {
  private nativeStorage = storage();

  private webStorage() {
    return getStorage(FirebaseAPI.app);
  }

  async upload({
    userId,
    transactionId,
    fileUri,
    mimeType,
  }: {
    userId: string;
    transactionId: string;
    fileUri: string;
    mimeType?: string;
  }): Promise<File> {
    const filename = fileUri.split("/").pop() ?? `file-${Date.now()}.jpg`;
    const path = filePath(userId, transactionId, filename);

    if (Platform.OS === "web") {
      const response = await fetch(fileUri);
      const blob = await response.blob();
      const bucketRef = ref(this.webStorage(), path);
      const metadata = mimeType ? { contentType: mimeType } : undefined;
      const task = await uploadBytesResumable(bucketRef, blob, metadata);
      const downloadUrl = await getDownloadURL(task.ref);
      return {
        id: path,
        userId,
        transactionId,
        downloadUrl,
        sizeInBytes: task.totalBytes,
        mimeType: metadata?.contentType ?? blob.type,
        createdAt: Date.now(),
      };
    }

    const result = await this.nativeStorage.ref(path).putFile(fileUri, {
      contentType: mimeType,
      cacheControl: "public, max-age=3600",
    });
    const downloadUrl = await this.nativeStorage.ref(path).getDownloadURL();
    return {
      id: path,
      userId,
      transactionId,
      downloadUrl,
      sizeInBytes: result.totalBytes,
      mimeType:
        result.metadata?.contentType ?? mimeType ?? "application/octet-stream",
      createdAt: Date.now(),
    };
  }

  async listByTransaction(
    userId: string,
    transactionId: string
  ): Promise<File[]> {
    const prefix = `files/${userId}/${transactionId}`;
    if (Platform.OS === "web") {
      const storageRef = ref(this.webStorage(), prefix);
      const { items } = await listAll(storageRef);
      const results: File[] = [];
      for (const item of items) {
        const downloadUrl = await getDownloadURL(item);
        results.push({
          id: item.fullPath,
          userId,
          transactionId,
          downloadUrl,
          sizeInBytes: 0,
          mimeType: "application/octet-stream",
          createdAt: Date.now(),
        });
      }
      return results;
    }

    const listResult = await this.nativeStorage.ref(prefix).listAll();
    const files: File[] = [];
    for (const item of listResult.items) {
      const metadata = await item.getMetadata();
      const downloadUrl = await item.getDownloadURL();
      files.push({
        id: item.fullPath,
        userId,
        transactionId,
        downloadUrl,
        sizeInBytes: metadata.size ?? 0,
        mimeType: metadata.contentType ?? "application/octet-stream",
        createdAt: metadata.timeCreated
          ? new Date(metadata.timeCreated).getTime()
          : Date.now(),
      });
    }
    return files;
  }

  async remove(file: File): Promise<void> {
    if (Platform.OS === "web") {
      const storageRef = ref(this.webStorage(), file.id);
      await deleteObject(storageRef);
      return;
    }
    await this.nativeStorage.ref(file.id).delete();
  }

  async getDownloadUrl(file: File): Promise<string> {
    if (Platform.OS === "web") {
      const storageRef = ref(this.webStorage(), file.id);
      return getDownloadURL(storageRef);
    }
    return this.nativeStorage.ref(file.id).getDownloadURL();
  }
}
```

> 🔄 Sincronize `File` em uma coleção Firestore (`files` ou subcoleção) se precisar de metadados adicionais ou busca avançada.

## 4. Mock

Implemente `src/data/mock/MockFileRepository.ts` anotando uploads em memória e gerando URLs `data:` para uso na UI. Isso garante experiência offline (`AppConfig.useMock === true`).

## 5. Registro e ViewModel

1. Atualize `src/store/diStore.ts` para registrar `TOKENS.FileRepository` com `FirebaseFileRepository` ou `MockFileRepository`.
2. Crie `useFilesViewModel`:

   ```ts
   export function useFilesViewModel(transactionId: string) {
     const { user } = useAuth();
     const di = useDI();
     const repo = useMemo(
       () => di.resolve<FileRepository>(TOKENS.FileRepository),
       [di]
     );
     const [files, setFiles] = useState<File[]>([]);
     const [loading, setLoading] = useState(false);

     const refresh = useCallback(async () => {
       if (!user) return;
       setLoading(true);
       const list = await repo.listByTransaction(user.id, transactionId);
       setFiles(list);
       setLoading(false);
     }, [repo, user, transactionId]);

     const upload = useCallback(
       async (fileUri: string, mimeType?: string) => {
         if (!user) throw new Error("User not authenticated");
         const file = await repo.upload({
           userId: user.id,
           transactionId,
           fileUri,
           mimeType,
         });
         setFiles((prev) => [file, ...prev]);
         return file;
       },
       [repo, user, transactionId]
     );

     const remove = useCallback(
       async (file: File) => {
         await repo.remove(file);
         setFiles((prev) => prev.filter((item) => item.id !== file.id));
       },
       [repo]
     );

     useEffect(() => {
       refresh();
     }, [refresh]);

     return { files, loading, refresh, upload, remove } as const;
   }
   ```

3. Conecte o ViewModel a um componente em `src/presentation/screens/Transactions/FileUploader.tsx` (por exemplo) para exibir previews e botões de upload.

## 6. UI e permissões

- Solicite permissões de câmera/galeria com `expo-image-picker` ou API nativa antes do upload.
- Em dispositivos iOS, adicione descrições em `Info.plist` (`NSPhotoLibraryUsageDescription`).
- Utilize compressão antes de enviar arquivos grandes.

## 7. Regras de segurança

Exemplo básico (Firebase Console → Storage Rules):

```txt
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /files/{userId}/{transactionId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 8. Troubleshooting

- **`storage/unauthorized`** → cheque regras e se o usuário está autenticado.
- **`storage/canceled`** → trate cancelamentos na UI.
- Upload lento → ajuste `cacheControl` e use rede Wi-Fi em testes.
- Web: garanta que `firebase/storage` esteja habilitado e que você importe dinamicamente funções que só existem no SDK web.

## Referências

- React Native Firebase Storage — [https://rnfirebase.io/storage/usage](https://rnfirebase.io/storage/usage)
- Regras Storage — [https://firebase.google.com/docs/storage/security](https://firebase.google.com/docs/storage/security)
- Expo + Upload de arquivos — [https://docs.expo.dev/versions/latest/sdk/imagepicker/](https://docs.expo.dev/versions/latest/sdk/imagepicker/)
