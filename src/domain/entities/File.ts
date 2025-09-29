export interface File {
  id: string;
  userId: string;
  transactionId: string;
  downloadUrl: string;
  sizeInBytes: number;
  mimeType: string;
  createdAt: number;
}
