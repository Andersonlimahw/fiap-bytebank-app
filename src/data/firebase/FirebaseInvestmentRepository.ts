import type { Investment } from "@app/domain/entities/Investment";
import type { InvestmentRepository } from "@app/domain/repositories/InvestmentRepository";
import { FirebaseAPI } from "@app/infrastructure/firebase/firebase";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";

export class FirebaseInvestmentRepository implements InvestmentRepository {
  private getCollection(userId: string) {
    const db = FirebaseAPI.db ?? getFirestore();
    return collection(db, 'users', userId, 'investments');
  }

  async listByUser(userId: string): Promise<Investment[]> {
    const snap = await getDocs(this.getCollection(userId));

    return snap.docs.map(
      (docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) =>
        ({
          id: docSnap.id,
          userId: userId,
          ...docSnap.data(),
        } as Investment)
    );
  }

  async save(userId: string, investment: Pick<Investment, 'id' | 'quantity'>): Promise<void> {
    const db = FirebaseAPI.db ?? getFirestore();
    await setDoc(doc(db, 'users', userId, 'investments', investment.id), { quantity: investment.quantity }, { merge: true });
  }

  async delete(userId: string, investmentId: string): Promise<void> {
    const db = FirebaseAPI.db ?? getFirestore();
    await deleteDoc(doc(db, 'users', userId, 'investments', investmentId));
  }
}
