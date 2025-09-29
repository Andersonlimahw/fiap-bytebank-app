export type CardBrand = 'bytebank' | 'nubank' | 'oyapal' | 'visa' | 'mastercard' | 'amex' | 'elo' | 'hipercard' | 'other';

export type DigitalCard = {
  id: string;
  userId: string;
  holderName: string;
  number: string; // PAN, stored for demo only. Do NOT store real PANs.
  cvv: string; // For demo only. Never store real CVV in production.
  expiry: string; // MM/YY
  brand?: CardBrand;
  nickname?: string;
  createdAt: number; // epoch ms
  updatedAt?: number; // epoch ms
};

