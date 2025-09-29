import type { PixRepository } from "@domain/repositories/PixRepository";
import type {
  PixFavorite,
  PixKey,
  PixKeyType,
  PixLimits,
  PixTransfer,
} from "@domain/entities/Pix";

export class MockPixRepository implements PixRepository {
  private keys = new Map<string, PixKey[]>();
  private favorites = new Map<string, PixFavorite[]>();
  private transfers = new Map<string, PixTransfer[]>();
  private limits = new Map<string, PixLimits>();

  async listKeys(userId: string): Promise<PixKey[]> {
    return this.keys.get(userId) ?? [];
  }
  async addKey(
    userId: string,
    type: PixKeyType,
    value?: string
  ): Promise<string> {
    const list = this.keys.get(userId) ?? [];
    const id = "mock_" + (Math.random() + "").slice(2);
    list.unshift({
      id,
      userId,
      type,
      value: value || id,
      active: true,
      createdAt: Date.now(),
    });
    this.keys.set(userId, list);
    return id;
  }
  async removeKey(_userId: string, keyId: string): Promise<void> {
    for (const [uid, list] of this.keys)
      this.keys.set(
        uid,
        list.filter((k) => k.id !== keyId)
      );
  }

  async transferByKey(params: {
    userId: string;
    toKey: string;
    amount: number;
    description?: string;
    toNameHint?: string;
  }): Promise<string> {
    const id = "tx_" + (Math.random() + "").slice(2);
    const list = this.transfers.get(params.userId) ?? [];
    list.unshift({
      id,
      userId: params.userId,
      toKey: params.toKey,
      toName: params.toNameHint,
      amount: params.amount,
      description: params.description,
      status: "completed",
      method: "key",
      createdAt: Date.now(),
    });
    this.transfers.set(params.userId, list);
    return id;
  }
  async payQr(params: { userId: string; qr: string }): Promise<string> {
    // Simplified: interpret the qr as key|amount|desc
    const [toKey, amountStr, desc] = params.qr.split("|");
    const amount = Number(amountStr) || 0;
    return this.transferByKey({
      userId: params.userId,
      toKey,
      amount,
      description: desc,
    });
  }
  async createQrCharge(params: {
    userId: string;
    amount?: number;
    description?: string;
  }): Promise<{ id: string; qr: string }> {
    const id = "qr_" + (Math.random() + "").slice(2);
    const qr = `PIXQR:${encodeURIComponent(
      JSON.stringify({
        v: 1,
        merchant: params.userId,
        chargeId: id,
        amount: params.amount ?? null,
        description: params.description ?? null,
      })
    )}`;
    return { id, qr };
  }
  async listFavorites(userId: string): Promise<PixFavorite[]> {
    return this.favorites.get(userId) ?? [];
  }
  async addFavorite(
    userId: string,
    alias: string,
    keyValue: string,
    name?: string
  ): Promise<string> {
    const id = "fav_" + (Math.random() + "").slice(2);
    const list = this.favorites.get(userId) ?? [];
    list.unshift({ id, userId, alias, keyValue, name, createdAt: Date.now() });
    this.favorites.set(userId, list);
    return id;
  }
  async removeFavorite(_userId: string, favoriteId: string): Promise<void> {
    for (const [uid, list] of this.favorites)
      this.favorites.set(
        uid,
        list.filter((f) => f.id !== favoriteId)
      );
  }
  async listTransfers(userId: string, limit = 20): Promise<PixTransfer[]> {
    const list = this.transfers.get(userId) ?? [];
    return list.slice(0, limit);
  }
  async getLimits(userId: string): Promise<PixLimits> {
    return (
      this.limits.get(userId) ?? {
        userId,
        dailyLimitCents: 500000,
        nightlyLimitCents: 100000,
        perTransferLimitCents: 300000,
        updatedAt: Date.now(),
      }
    );
  }
  async updateLimits(
    userId: string,
    partial: Partial<Omit<PixLimits, "userId">>
  ): Promise<void> {
    const cur = await this.getLimits(userId);
    this.limits.set(userId, {
      ...cur,
      ...partial,
      userId,
      updatedAt: Date.now(),
    });
  }
}
