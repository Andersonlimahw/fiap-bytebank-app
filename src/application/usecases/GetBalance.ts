import type { TransactionRepository } from "@domain/repositories/TransactionRepository";

export class GetBalance {
  constructor(private readonly txRepo: TransactionRepository) {}
  execute(userId: string): Promise<number> {
    return this.txRepo.getBalance(userId);
  }
}
