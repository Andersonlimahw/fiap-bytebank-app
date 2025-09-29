import { TOKENS } from "@app/core/di/container";
import { File } from "@app/domain/entities/File";
import {
  FileRepository,
  UploadFileInput,
} from "@app/domain/repositories/FileRepository";
import { useAuth } from "@app/store/authStore";
import { useDI } from "@app/store/diStore";
import { useCallback, useMemo, useState } from "react";

export function useFileViewModel() {
  const { user } = useAuth();
  const di = useDI();
  const repo = useMemo(
    () => di.resolve<FileRepository>(TOKENS.FileRepository),
    [di]
  );
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const uploadFile = useCallback(async (input: UploadFileInput) => {
    if (!user) throw new Error("User not authenticated");
    console.log(
      "uploadFile: File ViewModel User => ",
      user.id,
      "uploading file for transaction ",
      input.transactionId
    );

    const file = await repo.upload({
      userId: user.id,
      transactionId: input.transactionId != "" ? input.transactionId : user.id,
      fileUri: input.fileUri,
      fileName: input.fileName,
      mimeType: input.mimeType,
    });
    setFiles((prev) => [file, ...prev]);
    return file;
  }, []);

  const deleteFile = useCallback(
    async (file: File) => {
      setLoading(true);
      await repo.delete(file);
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
      setLoading(false);
    },
    [repo]
  );

  const refresh = useCallback(
    async (transactionId: string) => {
      if (!user) return;
      setLoading(true);
      const list = await repo.listByTransaction(user.id, transactionId);
      setFiles(list);
      setLoading(false);
    },
    [repo, user]
  );

  const getFileUrl = useCallback(
    async (file: File) => {
      if (!user) throw new Error("User not authenticated");
      return repo.getDownloadUrl(file);
    },
    [repo, user]
  );

  return {
    user,
    files,
    loading,
    uploadFile,
    deleteFile,
    refresh,
    getFileUrl,
  } as const;
}
