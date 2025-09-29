import type { Investment } from '../entities/Investment';

export interface InvestmentRepository {
  listByUser(userId: string): Promise<Investment[]>;
  save(userId: string, investment: Pick<Investment, 'id' | 'quantity'>): Promise<void>;
  delete(userId: string, investmentId: string): Promise<void>;
}
