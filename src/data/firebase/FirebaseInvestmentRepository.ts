import type { Investment } from "@app/domain/entities/Investment";
import type { InvestmentRepository } from "@app/domain/repositories/InvestmentRepository";
import { FirebaseAPI } from "@app/infrastructure/firebase/firebase";
import firestore, { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export class FirebaseInvestmentRepository implements InvestmentRepository {
  private getCollection(userId: string) {
    const db = FirebaseAPI.db ?? firestore();
    return db.collection('users').doc(userId).collection('investments');
  }

  async listByUser(userId: string): Promise<Investment[]> {
    const snap = await this.getCollection(userId).get();

    return snap.docs.map(
      (doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) =>
        ({
          id: doc.id,
          userId: userId,
          ...doc.data(),
        } as Investment)
    );
  }

  async save(userId: string, investment: Pick<Investment, 'id' | 'quantity'>): Promise<void> {
    await this.getCollection(userId).doc(investment.id).set({ quantity: investment.quantity }, { merge: true });
  }

  async delete(userId: string, investmentId: string): Promise<void> {
    await this.getCollection(userId).doc(investmentId).delete();
  }
}
