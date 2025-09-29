import type { DigitalCard } from '../entities/Card';

export interface CardRepository {
  listByUser(userId: string): Promise<DigitalCard[]>;
  add(card: Omit<DigitalCard, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
  update(id: string, updates: Partial<Omit<DigitalCard, 'id' | 'userId' | 'createdAt'>>): Promise<void>;
  remove(id: string): Promise<void>;
  subscribe?(userId: string, cb: (cards: DigitalCard[]) => void): () => void;
}

