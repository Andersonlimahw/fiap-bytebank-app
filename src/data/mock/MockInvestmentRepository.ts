import type { Investment } from "@domain/entities/Investment";
import type { InvestmentRepository } from "@domain/repositories/InvestmentRepository";

export class MockInvestmentRepository implements InvestmentRepository {
  async listByUser(userId: string): Promise<Investment[]> {
    console.log(`[Mock] listByUser for ${userId}`);
    return Promise.resolve([
      { id: "PETR4", userId: "1", quantity: 100 },
      { id: "MGLU3", userId: "1", quantity: 200 },
      { id: "VALE3", userId: "1", quantity: 50 },
      { id: "ITUB4", userId: "1", quantity: 300 },
    ]);
  }

  async save(userId: string, investment: Pick<Investment, 'id' | 'quantity'>): Promise<void> {
    console.log(`[Mock] save investment for ${userId}`, investment);
    return Promise.resolve();
  }

  async delete(userId: string, investmentId: string): Promise<void> {
    console.log(`[Mock] delete investment ${investmentId} for ${userId}`);
    return Promise.resolve();
  }
}