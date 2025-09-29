import type { CardRepository } from "@domain/repositories/CardRepository";
import type { DigitalCard } from "@domain/entities/Card";
import { FirebaseAPI } from "@infrastructure/firebase/firebase";
import firestore from "@react-native-firebase/firestore";

export class FirebaseCardRepository implements CardRepository {
  async listByUser(userId: string): Promise<DigitalCard[]> {
    const db = FirebaseAPI.db ?? firestore();
    const snap = await db
      .collection("cards")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();
    return snap?.docs.map((d: any) => {
      const data = d.data() as any;
      const createdAt = data.createdAt?.toMillis
        ? data.createdAt.toMillis()
        : Number(data.createdAt) || Date.now();
      const updatedAt = data.updatedAt?.toMillis
        ? data.updatedAt.toMillis()
        : Number(data.updatedAt) || undefined;
      return { id: d.id, ...data, createdAt, updatedAt } as DigitalCard;
    });
  }

  async add(
    card: Omit<DigitalCard, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    const db = FirebaseAPI.db ?? firestore();
    const res = await db.collection("cards").add({
      ...card,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
    return res.id;
  }

  async update(
    id: string,
    updates: Partial<Omit<DigitalCard, "id" | "userId" | "createdAt">>
  ): Promise<void> {
    const db = FirebaseAPI.db ?? firestore();
    const ref = db.collection("cards").doc(id);
    await ref.update({
      ...updates,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  }

  async remove(id: string): Promise<void> {
    const db = FirebaseAPI.db ?? firestore();
    const ref = db.collection("cards").doc(id);
    await ref.delete();
  }

  subscribe(userId: string, cb: (cards: DigitalCard[]) => void): () => void {
    const db = FirebaseAPI.db ?? firestore();
    const q = db
      .collection("cards")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc");
    const unsub = q.onSnapshot((snap: any) => {
      const list = snap?.docs.map((d: any) => {
        const data = d.data() as any;
        const createdAt = data.createdAt?.toMillis
          ? data.createdAt.toMillis()
          : Number(data.createdAt) || Date.now();
        const updatedAt = data.updatedAt?.toMillis
          ? data.updatedAt.toMillis()
          : Number(data.updatedAt) || undefined;
        return { id: d.id, ...data, createdAt, updatedAt } as DigitalCard;
      });
      cb(list);
    });
    return unsub;
  }
}
