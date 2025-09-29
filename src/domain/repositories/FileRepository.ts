import type { File } from "@domain/entities/File";

export type UploadFileInput = {
  userId: string;
  transactionId: string;
  fileUri: string;
  mimeType?: string;
  fileName?: string;
};

export type ListByTransactionInput = {
  userId: string;
  transactionId: string;
};

export type GetDownloadUrlInput = ListByTransactionInput;

export interface FileRepository {
  upload(input: UploadFileInput): Promise<File>;
  listByTransaction(userId: string, transactionId: string): Promise<File[]>;
  delete(input: File): Promise<void>;
  getDownloadUrl(input: File): Promise<string>;
}
