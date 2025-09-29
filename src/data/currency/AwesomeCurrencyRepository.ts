import type { CurrencyQuote } from "@app/domain/entities/CurrencyQuote";
import type { CurrencyRepository } from "@app/domain/repositories/CurrencyRepository";

type AwesomeAPIResponse = {
  [key: string]: {
    code: string;
    name: string;
    bid: string;
    pctChange: string;
    timestamp: string;
  };
};

export class AwesomeCurrencyRepository implements CurrencyRepository {
  async getQuote(pair: "USD-BRL"): Promise<CurrencyQuote | null> {
    try {
      const response = await fetch(
        `https://economia.awesomeapi.com.br/json/last/${pair}`
      );
      if (!response.ok) {
        console.error("Failed to fetch currency quote for", pair);
        return null;
      }
      const data: AwesomeAPIResponse = await response.json();
      const quoteData = data[pair.replace("-", "")];

      if (!quoteData) {
        return null;
      }

      return {
        code: quoteData.code,
        name: quoteData.name,
        bid: parseFloat(quoteData.bid),
        pctChange: parseFloat(quoteData.pctChange),
        lastUpdate: quoteData.timestamp,
      };
    } catch (error) {
      console.error("Error fetching currency quote:", error);
      return null;
    }
  }
}
