import type { File } from "@domain/entities/File";

export type TransactionType = "credit" | "debit";

export type Transaction = {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number; // cents
  description: string;
  category?: string;
  createdAt: number; // epoch ms
  file?: File;
};
