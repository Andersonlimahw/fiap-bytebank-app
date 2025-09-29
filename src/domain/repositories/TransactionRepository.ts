import type { Transaction } from '../entities/Transaction';

export interface TransactionRepository {
  listRecent(userId: string, limit?: number): Promise<Transaction[]>;
  add(tx: Omit<Transaction, 'id' | 'createdAt'>): Promise<string>; // returns id
  getBalance(userId: string): Promise<number>; // cents
  update(id: string, updates: Partial<Pick<Transaction, 'description' | 'amount' | 'type' | 'category'>>): Promise<void>;
  remove(id: string): Promise<void>;
  // Subscribe to recent transactions for a user; returns unsubscribe
  subscribeRecent?(userId: string, limit: number, cb: (txs: Transaction[]) => void): () => void;
}
