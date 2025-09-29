import type { PixFavorite, PixKey, PixKeyType, PixLimits, PixTransfer } from '../entities/Pix';

export interface PixRepository {
  // Keys
  listKeys(userId: string): Promise<PixKey[]>;
  addKey(userId: string, type: PixKeyType, value?: string): Promise<string>; // returns id
  removeKey(userId: string, keyId: string): Promise<void>;

  // Transfers
  transferByKey(params: { userId: string; toKey: string; amount: number; description?: string; toNameHint?: string }): Promise<string>;
  payQr(params: { userId: string; qr: string }): Promise<string>; // returns transfer id
  createQrCharge(params: { userId: string; amount?: number; description?: string }): Promise<{ id: string; qr: string }>;

  // Favorites
  listFavorites(userId: string): Promise<PixFavorite[]>;
  addFavorite(userId: string, alias: string, keyValue: string, name?: string): Promise<string>;
  removeFavorite(userId: string, favoriteId: string): Promise<void>;

  // History
  listTransfers(userId: string, limit?: number): Promise<PixTransfer[]>;

  // Limits
  getLimits(userId: string): Promise<PixLimits>;
  updateLimits(userId: string, partial: Partial<Omit<PixLimits, 'userId'>>): Promise<void>;
}

