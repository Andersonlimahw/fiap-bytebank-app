import type { CardRepository } from "@domain/repositories/CardRepository";
import type { DigitalCard } from "@domain/entities/Card";

function seed(userId: string): DigitalCard[] {
  const now = Date.now();
  return [
    {
      id: "c1",
      userId,
      holderName: "BYTE USER",
      number: "4111111111111111",
      cvv: "123",
      expiry: "12/27",
      brand: "bytebank",
      nickname: "Byte Digital",
      createdAt: now - 1000 * 60 * 60 * 24 * 60,
    },
    {
      id: "c2",
      userId,
      holderName: "BYTE USER",
      number: "5555444433331111",
      cvv: "999",
      expiry: "08/29",
      brand: "nubank",
      nickname: "Nu",
      createdAt: now - 1000 * 60 * 60 * 24 * 30,
    },
  ];
}

export class MockCardRepository implements CardRepository {
  private byUser = new Map<string, DigitalCard[]>();
  private listeners = new Map<string, Set<(cards: DigitalCard[]) => void>>();

  private ensure(userId: string) {
    if (!this.byUser.has(userId)) this.byUser.set(userId, seed(userId));
    return this.byUser.get(userId)!;
  }

  private emit(userId: string) {
    const set = this.listeners.get(userId);
    if (!set) return;
    const items = [...this.ensure(userId)].sort(
      (a, b) => b.createdAt - a.createdAt
    );
    set.forEach((cb) => cb(items));
  }

  async listByUser(userId: string): Promise<DigitalCard[]> {
    return [...this.ensure(userId)].sort((a, b) => b.createdAt - a.createdAt);
  }

  async add(
    card: Omit<DigitalCard, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    const id = "card-" + Math.random().toString(36).slice(2);
    const full: DigitalCard = {
      ...card,
      id,
      createdAt: Date.now(),
    } as DigitalCard;
    const arr = this.ensure(card.userId);
    arr.unshift(full);
    this.byUser.set(card.userId, arr);
    this.emit(card.userId);
    return id;
  }

  async update(
    id: string,
    updates: Partial<Omit<DigitalCard, "id" | "userId" | "createdAt">>
  ): Promise<void> {
    for (const [userId, list] of this.byUser.entries()) {
      const idx = list.findIndex((c) => c.id === id);
      if (idx >= 0) {
        list[idx] = {
          ...list[idx],
          ...updates,
          updatedAt: Date.now(),
        } as DigitalCard;
        this.byUser.set(userId, list);
        this.emit(userId);
        return;
      }
    }
  }

  async remove(id: string): Promise<void> {
    for (const [userId, list] of this.byUser.entries()) {
      const next = list.filter((c) => c.id !== id);
      if (next.length !== list.length) {
        this.byUser.set(userId, next);
        this.emit(userId);
        return;
      }
    }
  }

  subscribe(userId: string, cb: (cards: DigitalCard[]) => void): () => void {
    const set = this.listeners.get(userId) ?? new Set();
    this.listeners.set(userId, set);
    set.add(cb);
    cb([...this.ensure(userId)].sort((a, b) => b.createdAt - a.createdAt));
    return () => {
      const s = this.listeners.get(userId);
      if (!s) return;
      s.delete(cb);
      if (s.size === 0) this.listeners.delete(userId);
    };
  }
}
