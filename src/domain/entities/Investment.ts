export type Investment = {
  // User's portfolio data
  id: string; // The ticker symbol, e.g., "PETR4"
  userId: string;
  quantity: number; // Number of shares owned

  // Real-time data from API, fetched separately
  longName?: string;
  regularMarketPrice?: number; // Current price in cents
  regularMarketChangePercent?: number; // Daily percentage change
  logoUrl?: string;
};