import type { TransactionRepository } from "@domain/repositories/TransactionRepository";
import type { Transaction } from "@domain/entities/Transaction";
import { FirebaseAPI } from "../../infrastructure/firebase/firebase";
import {
  getFirestore,
  serverTimestamp,
} from "@react-native-firebase/firestore";

export class FirebaseTransactionRepository implements TransactionRepository {
  async listRecent(userId: string, limit = 10): Promise<Transaction[]> {
    const db = FirebaseAPI.db ?? getFirestore();
    const q = db
      .collection("transactions")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(limit);

    const snap = await q.get();
    return snap?.docs.map((d: any) => {
      const data = d.data() as any;
      const createdAt = data.createdAt?.toMillis
        ? data.createdAt.toMillis()
        : Number(data.createdAt) || Date.now();
      return { id: d.id, ...data, createdAt } as Transaction;
    });
  }

  async add(tx: Omit<Transaction, "id" | "createdAt">): Promise<string> {
    const db = FirebaseAPI.db ?? getFirestore();
    const res = await db.collection("transactions").add({
      ...tx,
      createdAt: serverTimestamp(),
    });
    return res.id;
  }

  async getBalance(userId: string): Promise<number> {
    // For demo simplicity, compute from last 100 txs
    const txs = await this.listRecent(userId, 100);
    if (!txs) return 0;

    return txs.reduce(
      (acc, t) => acc + (t.type === "credit" ? t.amount : -t.amount),
      0
    );
  }

  async update(
    id: string,
    updates: Partial<
      Pick<Transaction, "description" | "amount" | "type" | "category">
    >
  ): Promise<void> {
    const db = FirebaseAPI.db ?? getFirestore();
    const ref = db.collection("transactions").doc(id);
    await ref.update({ ...updates });
  }

  async remove(id: string): Promise<void> {
    const db = FirebaseAPI.db ?? getFirestore();
    const ref = db.collection("transactions").doc(id);
    await ref.delete();
  }

  subscribeRecent(
    userId: string,
    limit = 10,
    cb: (txs: Transaction[]) => void
  ): () => void {
    const db = FirebaseAPI.db ?? getFirestore();
    const q = db
      .collection("transactions")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(limit);

    const unsub = q.onSnapshot((snap: any) => {
      const list = snap?.docs.map((d: any) => {
        const data = d.data() as any;
        const createdAt = data.createdAt?.toMillis
          ? data.createdAt.toMillis()
          : Number(data.createdAt) || Date.now();
        return { id: d.id, ...data, createdAt } as Transaction;
      });
      cb(list);
    });
    return unsub;
  }
}
