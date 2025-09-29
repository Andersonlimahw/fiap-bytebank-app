import { useCallback, useEffect, useMemo, useState } from "react";
import { useDI } from "@store/diStore";
import { TOKENS } from "@core/di/container";
import type { CardRepository } from "@domain/repositories/CardRepository";
import type { DigitalCard } from "@domain/entities/Card";
import { useAuth } from "@store/authStore";

export function useDigitalCardsViewModel() {
  const di = useDI();
  const repo = useMemo(
    () => di.resolve<CardRepository>(TOKENS.CardRepository),
    [di]
  );
  const { user } = useAuth();
  const [cards, setCards] = useState<DigitalCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const list = await repo.listByUser(user.id);
    setCards(list);
    setLoading(false);
  }, [repo, user]);

  const addCard = useCallback(
    async (input: Omit<DigitalCard, "id" | "createdAt" | "updatedAt">) => {
      const id = await repo.add(input);
      await refresh();
      return id;
    },
    [repo, refresh]
  );

  const updateCard = useCallback(
    async (
      id: string,
      updates: Partial<Omit<DigitalCard, "id" | "userId" | "createdAt">>
    ) => {
      await repo.update(id, updates);
      await refresh();
    },
    [repo, refresh]
  );

  const removeCard = useCallback(
    async (id: string) => {
      await repo.remove(id);
      await refresh();
    },
    [repo, refresh]
  );

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const unsub = repo.subscribe?.(user.id, (list) => {
      setCards(list);
      setLoading(false);
    });
    if (!unsub) {
      // fallback if repo does not support subscribe
      refresh();
    }
    return () => unsub?.();
  }, [repo, user, refresh]);

  return {
    cards,
    loading,
    refresh,
    addCard,
    updateCard,
    removeCard,
    user,
  } as const;
}
