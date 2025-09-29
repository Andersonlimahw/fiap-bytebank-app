export type PixKeyType = 'email' | 'phone' | 'cpf' | 'random';

export type PixKey = {
  id: string;
  userId: string;
  type: PixKeyType;
  value: string;
  createdAt: number;
  active: boolean;
};

export type PixTransferStatus = 'pending' | 'completed' | 'failed';

export type PixTransfer = {
  id: string;
  userId: string; // payer id (current user)
  toKey: string; // destination PIX key value
  toName?: string;
  amount: number; // in cents
  description?: string;
  createdAt: number;
  status: PixTransferStatus;
  method: 'key' | 'qr';
};

export type PixFavorite = {
  id: string;
  userId: string;
  alias: string;
  keyValue: string;
  name?: string;
  createdAt: number;
};

export type PixLimits = {
  userId: string;
  dailyLimitCents: number;
  nightlyLimitCents: number;
  perTransferLimitCents: number;
  updatedAt: number;
};

