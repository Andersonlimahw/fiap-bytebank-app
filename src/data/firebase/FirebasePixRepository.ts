import type { PixRepository } from "@domain/repositories/PixRepository";
import type {
  PixFavorite,
  PixKey,
  PixKeyType,
  PixLimits,
  PixTransfer,
} from "@domain/entities/Pix";
import { FirebaseAPI } from "../../infrastructure/firebase/firebase";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
  setDoc,
  orderBy,
  limit,
  serverTimestamp,
} from "@react-native-firebase/firestore";

function tsToMillis(ts: any): number {
  return ts?.toMillis ? ts.toMillis() : Number(ts) || Date.now();
}

export class FirebasePixRepository implements PixRepository {
  // Keys CRUD
  async listKeys(userId: string): Promise<PixKey[]> {
    const db = FirebaseAPI.db ?? getFirestore();
    const q = query(collection(db, "pixKeys"), where("userId", "==", userId));
    const snap = await getDocs(q);
    return snap?.docs.map((d: any) => {
      const data = d.data() as any;
      return {
        id: d.id,
        ...data,
        createdAt: tsToMillis(data.createdAt),
      } as PixKey;
    });
  }

  async addKey(
    userId: string,
    type: PixKeyType,
    value?: string
  ): Promise<string> {
    const db = FirebaseAPI.db ?? getFirestore();
    // Basic format validation
    const v = (value || "").trim();
    if (type === "email") {
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (!ok) throw new Error("E-mail inválido.");
    }
    if (type === "phone") {
      const digits = v.replace(/\D/g, "");
      // Accept 10-13 digits to accommodate country code + area + number
      if (digits.length < 10 || digits.length > 13)
        throw new Error("Telefone inválido.");
      value = digits;
    }
    if (type === "cpf") {
      const digits = v.replace(/\D/g, "");
      if (digits.length !== 11) throw new Error("CPF inválido.");
      value = digits;
    }
    // Basic constraints: prevent more than one of email/phone/cpf; allow up to 5 random keys
    if (type !== "random") {
      const existing = await getDocs(
        query(
          collection(db, "pixKeys"),
          where("userId", "==", userId),
          where("type", "==", type)
        )
      );
      if (!existing.empty) {
        throw new Error("Você já possui uma chave deste tipo.");
      }
    } else {
      const existingRandom = await getDocs(
        query(
          collection(db, "pixKeys"),
          where("userId", "==", userId),
          where("type", "==", "random")
        )
      );
      if (existingRandom.size >= 5) {
        throw new Error("Limite de chaves aleatórias atingido (5).");
      }
    }

    const res = await addDoc(collection(db, "pixKeys"), {
      userId,
      type,
      value: value || this.generateRandomKey(),
      active: true,
      createdAt: serverTimestamp(),
    });
    return res.id;
  }

  async removeKey(userId: string, keyId: string): Promise<void> {
    const db = FirebaseAPI.db ?? getFirestore();
    const ref = doc(db, "pixKeys", keyId);
    await deleteDoc(ref);
  }

  // Transfers and QR
  async transferByKey(params: {
    userId: string;
    toKey: string;
    amount: number;
    description?: string;
    toNameHint?: string;
  }): Promise<string> {
    const { userId, toKey, amount, description, toNameHint } = params;
    if (amount <= 0) throw new Error("Invalid amount");
    const db = FirebaseAPI.db ?? getFirestore();

    // Enforce PIX limits (daily, nightly, and per transfer)
    const limits = await this.getLimits(userId);
    if (
      limits &&
      limits.perTransferLimitCents &&
      amount > limits.perTransferLimitCents
    ) {
      throw new Error("Valor excede o limite por transferência.");
    }

    // Load recent transfers and compute today's totals
    const qRecent = query(
      collection(db, "pixTransfers"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(200)
    );
    const snap = await getDocs(qRecent);
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(0, 0, 0, 0);
    const isNight = now.getHours() >= 22 || now.getHours() < 6;
    let todayTotal = 0;
    let nightlyWindowTotal = 0;
    const nightlyStart = new Date(now);
    // Consider nightly window 22:00-06:00
    if (now.getHours() < 6) {
      // early morning: nightly started yesterday 22:00
      nightlyStart.setDate(now.getDate() - 1);
      nightlyStart.setHours(22, 0, 0, 0);
    } else {
      nightlyStart.setHours(22, 0, 0, 0);
    }

    snap?.docs.forEach((d: any) => {
      const data = d.data() as any;
      const createdAt = tsToMillis(data.createdAt);
      if (createdAt >= midnight.getTime() && data.status === "completed") {
        todayTotal += Number(data.amount) || 0;
      }
      if (createdAt >= nightlyStart.getTime() && data.status === "completed") {
        nightlyWindowTotal += Number(data.amount) || 0;
      }
    });

    if (
      limits &&
      limits.dailyLimitCents &&
      todayTotal + amount > limits.dailyLimitCents
    ) {
      throw new Error("Limite diário de PIX excedido.");
    }
    if (
      isNight &&
      limits &&
      limits.nightlyLimitCents &&
      nightlyWindowTotal + amount > limits.nightlyLimitCents
    ) {
      throw new Error("Limite noturno de PIX excedido.");
    }

    // Create a PIX transfer doc for payer
    const transferRef = await addDoc(collection(db, "pixTransfers"), {
      userId,
      toKey,
      toName: toNameHint || null,
      amount,
      description: description || null,
      method: "key",
      status: "completed",
      createdAt: serverTimestamp(),
    });

    // Mirror debit for payer
    await addDoc(collection(db, "transactions"), {
      userId,
      type: "debit",
      amount,
      description: description || `PIX para ${toNameHint || toKey}`,
      createdAt: serverTimestamp(),
      category: "Pix",
    } as any);

    // Attempt to credit recipient by resolving key owner
    try {
      const keySnap = await getDocs(
        query(
          collection(db, "pixKeys"),
          where("value", "==", toKey),
          limit(1)
        )
      );
      if (!keySnap.empty) {
        const keyDoc = keySnap?.docs[0].data() as any;
        const recipientId = keyDoc.userId as string | undefined;
        if (recipientId) {
          await addDoc(collection(db, "transactions"), {
            userId: recipientId,
            type: "credit",
            amount,
            description: description || `PIX de ${userId}`,
            createdAt: serverTimestamp(),
            category: "Pix",
          } as any);
        }
      }
    } catch {
      // Best-effort; ignore recipient credit errors
    }

    return transferRef.id;
  }

  async payQr(params: { userId: string; qr: string }): Promise<string> {
    const { userId, qr } = params;
    const parsed = this.parseQr(qr);
    const amount = parsed.amount ?? 0;
    const desc = parsed.description || "PIX QR";
    const toKey = parsed.toKey || "qr:static";
    const merchantId = parsed.merchant;

    const transferId = await this.transferByKey({
      userId,
      toKey,
      amount,
      description: desc,
      toNameHint: merchantId,
    });
    try {
      const db = FirebaseAPI.db ?? getFirestore();
      await updateDoc(doc(db, "pixTransfers", transferId), { method: "qr" });
    } catch {}

    // If this QR references a generated charge, mark it paid and credit the merchant
    const db2 = FirebaseAPI.db ?? getFirestore();
    if (toKey && merchantId) {
      try {
        const chargeRef = doc(db2, "pixQrCharges", toKey);
        await updateDoc(chargeRef, {
          status: "paid",
          paidAt: serverTimestamp(),
          payerId: userId,
        });
        // Credit merchant with incoming PIX
        await addDoc(collection(db2, "transactions"), {
          userId: merchantId,
          type: "credit",
          amount,
          description: desc || `PIX via QR`,
          createdAt: serverTimestamp(),
          category: "Pix",
        } as any);
      } catch {
        // best-effort
      }
    }

    return transferId;
  }

  async createQrCharge(params: {
    userId: string;
    amount?: number;
    description?: string;
  }): Promise<{ id: string; qr: string }> {
    const { userId, amount, description } = params;
    const db = FirebaseAPI.db ?? getFirestore();
    const docRef = await addDoc(collection(db, "pixQrCharges"), {
      userId,
      amount: amount ?? null,
      description: description || null,
      status: "pending",
      createdAt: serverTimestamp(),
    });
    const qr = this.buildQr({
      userId,
      chargeId: docRef.id,
      amount,
      description,
    });
    await updateDoc(doc(db, "pixQrCharges", docRef.id), {
      payload: qr,
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, qr };
  }

  // Favorites
  async listFavorites(userId: string): Promise<PixFavorite[]> {
    const db = FirebaseAPI.db ?? getFirestore();
    const q = query(
      collection(db, "pixFavorites"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap?.docs.map((d: any) => {
      const data = d.data() as any;
      return {
        id: d.id,
        ...data,
        createdAt: tsToMillis(data.createdAt),
      } as PixFavorite;
    });
  }

  async addFavorite(
    userId: string,
    alias: string,
    keyValue: string,
    name?: string
  ): Promise<string> {
    const db = FirebaseAPI.db ?? getFirestore();
    const res = await addDoc(collection(db, "pixFavorites"), {
      userId,
      alias,
      keyValue,
      name: name || null,
      createdAt: serverTimestamp(),
    });
    return res.id;
  }

  async removeFavorite(userId: string, favoriteId: string): Promise<void> {
    const db = FirebaseAPI.db ?? getFirestore();
    const ref = doc(db, "pixFavorites", favoriteId);
    await deleteDoc(ref);
  }

  // History
  async listTransfers(userId: string, limitCount = 20): Promise<PixTransfer[]> {
    const db = FirebaseAPI.db ?? getFirestore();
    const q = query(
      collection(db, "pixTransfers"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap?.docs.map((d: any) => {
      const data = d.data() as any;
      return {
        id: d.id,
        ...data,
        createdAt: tsToMillis(data.createdAt),
      } as PixTransfer;
    });
  }

  // Limits
  async getLimits(userId: string): Promise<PixLimits> {
    const db = FirebaseAPI.db ?? getFirestore();
    const ref = doc(db, "pixLimits", userId);
    const snap = await getDocs(query(collection(db, "pixLimits"), where("__name__", "==", userId), limit(1)));
    if (!snap.empty) {
      const data = snap.docs[0].data() as any;
      return {
        userId,
        dailyLimitCents: data.dailyLimitCents ?? 500000, // R$ 5.000,00
        nightlyLimitCents: data.nightlyLimitCents ?? 100000, // R$ 1.000,00
        perTransferLimitCents: data.perTransferLimitCents ?? 300000, // R$ 3.000,00
        updatedAt: tsToMillis(data.updatedAt) ?? Date.now(),
      };
    }
    const defaults: PixLimits = {
      userId,
      dailyLimitCents: 500000,
      nightlyLimitCents: 100000,
      perTransferLimitCents: 300000,
      updatedAt: Date.now(),
    };
    await setDoc(ref, {
      ...defaults,
      updatedAt: serverTimestamp(),
    });
    return defaults;
  }

  async updateLimits(
    userId: string,
    partial: Partial<Omit<PixLimits, "userId">>
  ): Promise<void> {
    const db = FirebaseAPI.db ?? getFirestore();
    const ref = doc(db, "pixLimits", userId);
    await setDoc(
      ref,
      { ...partial, updatedAt: serverTimestamp(), userId },
      { merge: true }
    );
  }

  // Helpers (simplified QR payload, not full EMV)
  private buildQr({
    userId,
    chargeId,
    amount,
    description,
  }: {
    userId: string;
    chargeId: string;
    amount?: number;
    description?: string;
  }): string {
    // Keep a simple, RN-safe payload; not full EMV QR. Avoid Buffer/btoa for RN compatibility.
    const payload = encodeURIComponent(
      JSON.stringify({
        v: 1,
        ns: "BR.GOV.BCB.PIX",
        merchant: userId,
        chargeId,
        amount: amount ?? null,
        description: description || null,
      })
    );
    return "PIXQR:" + payload;
  }

  private parseQr(qr: string): {
    toKey?: string;
    merchant?: string;
    amount?: number;
    description?: string;
  } {
    try {
      if (qr.startsWith("PIXQR:")) {
        const json = JSON.parse(decodeURIComponent(qr.replace("PIXQR:", "")));
        return {
          toKey: json.chargeId,
          merchant: json.merchant,
          amount: json.amount ?? undefined,
          description: json.description ?? undefined,
        };
      }
      // Very simplified: try parse key|amount|desc
      const parts = qr.split("|");
      const amount = Number(parts[1]) || undefined;
      const description = parts[2];
      return { toKey: parts[0], amount, description };
    } catch {
      return {};
    }
  }

  private generateRandomKey() {
    // random UUID-like (not crypto-strong), suitable for demo purposes
    return (
      "key_" + Math.random().toString(36).slice(2) + Date.now().toString(36)
    );
  }
}
