import type { CurrencyQuote } from '../entities/CurrencyQuote';

export interface CurrencyRepository {
  getQuote(pair: 'USD-BRL'): Promise<CurrencyQuote | null>;
}
