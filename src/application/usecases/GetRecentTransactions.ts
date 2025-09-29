import type { TransactionRepository } from "@domain/repositories/TransactionRepository";
import type { Transaction } from "@domain/entities/Transaction";

export class GetRecentTransactions {
  constructor(private readonly txRepo: TransactionRepository) {}
  execute(userId: string, limit = 10): Promise<Transaction[]> {
    return this.txRepo.listRecent(userId, limit);
  }
}
