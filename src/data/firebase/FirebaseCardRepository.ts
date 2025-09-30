import type { CardRepository } from "@domain/repositories/CardRepository";
import type { DigitalCard } from "@domain/entities/Card";
import { FirebaseAPI } from "@infrastructure/firebase/firebase";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "@react-native-firebase/firestore";

export class FirebaseCardRepository implements CardRepository {
  async listByUser(userId: string): Promise<DigitalCard[]> {
    const db = FirebaseAPI.db ?? getFirestore();
    const q = query(
      collection(db, "cards"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
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
    const db = FirebaseAPI.db ?? getFirestore();
    const res = await addDoc(collection(db, "cards"), {
      ...card,
      createdAt: serverTimestamp(),
    });
    return res.id;
  }

  async update(
    id: string,
    updates: Partial<Omit<DigitalCard, "id" | "userId" | "createdAt">>
  ): Promise<void> {
    const db = FirebaseAPI.db ?? getFirestore();
    const ref = doc(db, "cards", id);
    await updateDoc(ref, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  async remove(id: string): Promise<void> {
    const db = FirebaseAPI.db ?? getFirestore();
    const ref = doc(db, "cards", id);
    await deleteDoc(ref);
  }

  subscribe(userId: string, cb: (cards: DigitalCard[]) => void): () => void {
    const db = FirebaseAPI.db ?? getFirestore();
    const q = query(
      collection(db, "cards"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap: any) => {
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
