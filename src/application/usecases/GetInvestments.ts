import type { Investment } from "@domain/entities/Investment";
import type { InvestmentRepository } from "@domain/repositories/InvestmentRepository";

export class GetInvestments {
  constructor(private repo: InvestmentRepository) {}
  async execute(userId: string): Promise<Investment[]> {
    return this.repo.listByUser(userId);
  }
}
