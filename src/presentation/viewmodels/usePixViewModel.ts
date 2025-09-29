import { useCallback, useEffect, useMemo, useState } from "react";
import { useDI } from "@store/diStore";
import { TOKENS } from "@core/di/container";
import type {
  PixFavorite,
  PixKey,
  PixLimits,
  PixTransfer,
} from "@domain/entities/Pix";
import type { PixRepository } from "@domain/repositories/PixRepository";
import { useAuth } from "@store/authStore";

export function usePixViewModel() {
  const di = useDI();
  const repo = useMemo(
    () => di.resolve<PixRepository>(TOKENS.PixRepository),
    [di]
  );
  const { user } = useAuth();
  const [keys, setKeys] = useState<PixKey[]>([]);
  const [favorites, setFavorites] = useState<PixFavorite[]>([]);
  const [transfers, setTransfers] = useState<PixTransfer[]>([]);
  const [limits, setLimits] = useState<PixLimits | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [ks, favs, txs, lim] = await Promise.all([
        repo.listKeys(user.id),
        repo.listFavorites(user.id),
        repo.listTransfers(user.id, 20),
        repo.getLimits(user.id),
      ]);
      setKeys(ks);
      setFavorites(favs);
      setTransfers(txs);
      setLimits(lim);
    } catch (e: any) {
      setError(e?.message ?? "Erro ao carregar PIX");
    } finally {
      setLoading(false);
    }
  }, [repo, user]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;
      await refresh();
    })();
    return () => {
      mounted = false;
    };
  }, [refresh]);

  const sendByKey = useCallback(
    async (toKey: string, amountCents: number, description?: string) => {
      if (!user) return;
      await repo.transferByKey({
        userId: user.id,
        toKey,
        amount: amountCents,
        description,
      });
      await refresh();
    },
    [repo, user, refresh]
  );

  const payQr = useCallback(
    async (qr: string) => {
      if (!user) return;
      await repo.payQr({ userId: user.id, qr });
      await refresh();
    },
    [repo, user, refresh]
  );

  const createQr = useCallback(
    async (amountCents?: number, description?: string) => {
      if (!user) return { id: "", qr: "" };
      const res = await repo.createQrCharge({
        userId: user.id,
        amount: amountCents,
        description,
      });
      return res;
    },
    [repo, user]
  );

  const addKey = useCallback(
    async (type: PixKey["type"], value?: string) => {
      if (!user) return;
      await repo.addKey(user.id, type, value);
      await refresh();
    },
    [repo, user, refresh]
  );

  const removeKey = useCallback(
    async (keyId: string) => {
      if (!user) return;
      await repo.removeKey(user.id, keyId);
      await refresh();
    },
    [repo, user, refresh]
  );

  const addFav = useCallback(
    async (alias: string, keyValue: string, name?: string) => {
      if (!user) return;
      await repo.addFavorite(user.id, alias, keyValue, name);
      await refresh();
    },
    [repo, user, refresh]
  );

  const removeFav = useCallback(
    async (favoriteId: string) => {
      if (!user) return;
      await repo.removeFavorite(user.id, favoriteId);
      await refresh();
    },
    [repo, user, refresh]
  );

  const updateLimits = useCallback(
    async (partial: Partial<Omit<PixLimits, "userId">>) => {
      if (!user) return;
      await repo.updateLimits(user.id, partial);
      await refresh();
    },
    [repo, user, refresh]
  );

  return {
    loading,
    error,
    keys,
    favorites,
    transfers,
    limits,
    refresh,
    sendByKey,
    payQr,
    createQr,
    addKey,
    removeKey,
    addFav,
    removeFav,
    updateLimits,
  } as const;
}
