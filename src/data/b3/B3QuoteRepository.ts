import type { Investment } from "@domain/entities/Investment";

export type TickerSuggestion = { id: string; name: string };
export type AddInvestimentInput = { ticker: string; quantity: number };

// This could be defined in domain/repositories if used elsewhere
export interface QuoteRepository {
  getQuote(ticker: string): Promise<Partial<Investment> | null>;
  search(query: string): Promise<TickerSuggestion[] | null>;
}

type BrapiQuote = {
  symbol: string;
  longName: string;
  regularMarketPrice: number;
  regularMarketChangePercent: number;
  logourl: string;
};

type BrapiSearch = {
  stocks: Array<{ stock: string; name: string }>;
};

const BEARER_TOKEN = "p6j38bVSefgui6rCkjcCpT";

export class B3QuoteRepository implements QuoteRepository {
  async getQuote(ticker: string): Promise<Partial<Investment> | null> {
    try {
      const response = await fetch(
        `https://brapi.dev/api/quote/${ticker}?token=${BEARER_TOKEN}`
      );
      if (!response.ok) {
        console.error("Failed to fetch quote for", ticker);
        return null;
      }
      const data = await response.json();
      const quote: BrapiQuote = data.results?.[0];

      if (!quote) {
        return null;
      }

      return {
        id: quote.symbol,
        longName: quote.longName,
        regularMarketPrice: quote.regularMarketPrice,
        regularMarketChangePercent: quote.regularMarketChangePercent,
        logoUrl: quote.logourl,
      };
    } catch (error) {
      console.error("Error fetching quote:", error);
      return null;
    }
  }

  async search(query: string): Promise<any | null> {
    if (!query || query.length < 4) {
      return [];
    }
    try {
      const response = await fetch(
        `https://brapi.dev/api/quote/${query}?token=${BEARER_TOKEN}`
      );
      if (!response.ok) {
        console.error("Error searching tickers: Invalid response", {
          status: response.status,
          statusText: response.statusText,
          body: await response.text(),
        });
        return null;
      }
      // const data: BrapiSearch = await response.json();
      // return data.stocks.map((s: { stock: string; name: string }) => ({
      //   id: s.stock,
      //   name: s.name,
      // }));
      const data = await response.json();
      const quote: BrapiQuote = data.results?.[0];

      if (!quote) {
        return null;
      }
      return {
        id: quote.symbol,
        longName: quote.longName,
        regularMarketPrice: quote.regularMarketPrice,
        regularMarketChangePercent: quote.regularMarketChangePercent,
        logoUrl: quote.logourl,
      };
    } catch (error) {
      console.error("Error searching tickers:", error);
      return null;
    }
  }
}
