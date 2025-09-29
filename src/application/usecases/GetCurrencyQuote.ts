import type { CurrencyRepository } from '@app/domain/repositories/CurrencyRepository';

export class GetCurrencyQuote {
  constructor(private readonly currencyRepository: CurrencyRepository) {}

  execute(pair: 'USD-BRL') {
    return this.currencyRepository.getQuote(pair);
  }
}
