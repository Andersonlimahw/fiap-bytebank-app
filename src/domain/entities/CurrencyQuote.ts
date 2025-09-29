export type CurrencyQuote = {
  code: string; // e.g., 'USD'
  name: string; // e.g., 'Dólar Americano/Real Brasileiro'
  bid: number; // Purchase price, e.g., 5.3442
  pctChange: number; // e.g., 0.266418
  lastUpdate: string; // e.g., "1758818804"
};
