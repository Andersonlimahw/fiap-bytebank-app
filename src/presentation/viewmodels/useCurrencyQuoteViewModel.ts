import { useCallback, useState, useEffect } from 'react';
import { useDI } from '@app/store/diStore';
import { TOKENS } from '@app/core/di/container';
import { GetCurrencyQuote } from '@app/application/usecases/GetCurrencyQuote';
import type { CurrencyQuote } from '@app/domain/entities/CurrencyQuote';

export function useCurrencyQuoteViewModel() {
  const currencyRepository = useDI().resolve(TOKENS.CurrencyRepository);
  const getCurrencyQuote = new GetCurrencyQuote(currencyRepository);

  const [quote, setQuote] = useState<CurrencyQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuote = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getCurrencyQuote.execute('USD-BRL');
      setQuote(result);
    } catch (e) {
      console.error('Failed to fetch currency quote:', e);
      setError('Não foi possível carregar a cotação do dólar.');
    } finally {
      setIsLoading(false);
    }
  }, [getCurrencyQuote]);

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  return {
    quote,
    isLoading,
    error,
    fetchQuote,
  };
}
