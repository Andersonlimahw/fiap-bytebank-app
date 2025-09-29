import { useCallback, useEffect, useMemo, useState } from "react";
import { useDI } from "@store/diStore";
import { TOKENS } from "@core/di/container";
import type { Transaction } from "@domain/entities/Transaction";
import type { TransactionRepository } from "@domain/repositories/TransactionRepository";
import { useAuth } from "@store/authStore";

export function useExtractViewModel() {
  const di = useDI();
  const repo = useMemo(
    () => di.resolve<TransactionRepository>(TOKENS.TransactionRepository),
    [di]
  );
  const { user } = useAuth();

  const [all, setAll] = useState<Transaction[]>([]);
  const [filtered, setFiltered] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const list = await repo.listRecent(user.id, 100);
    setAll(list);
    setLoading(false);
  }, [repo, user]);

  const remove = useCallback(
    async (id: string) => {
      setLoading(true);
      await repo.remove(id);
      // If realtime is available, rely on it to refresh the list
      if (typeof repo.subscribeRecent === "function") {
        setLoading(false);
        return;
      }
      await refresh();
    },
    [repo, refresh]
  );

  const update = useCallback(
    async (
      id: string,
      updates: Partial<
        Pick<Transaction, "description" | "amount" | "type" | "category">
      >
    ) => {
      setLoading(true);
      await repo.update(id, updates);
      if (typeof repo.subscribeRecent === "function") {
        setLoading(false);
        return;
      }
      await refresh();
    },
    [repo, refresh]
  );

  useEffect(() => {
    if (!user) return;
    // Prefer real-time subscription when available
    if (typeof repo.subscribeRecent === "function") {
      setLoading(true);
      const unsub = repo.subscribeRecent(user.id, 100, (txs) => {
        setAll(txs);
        setLoading(false);
      });
      return () => unsub();
    }
    // Fallback to one-shot load without depending on refresh identity
    let mounted = true;
    (async () => {
      if (!mounted) return;
      setLoading(true);
      const list = await repo.listRecent(user.id, 100);
      if (!mounted) return;
      setAll(list);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [repo, user]);

  useEffect(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      setFiltered(all);
      return;
    }
    const result = all.filter((t) => {
      const amountStr = (t.amount / 100).toFixed(2);
      const date = new Date(t.createdAt);
      const dateStr = date.toLocaleDateString("pt-BR");
      const monthStr = date
        .toLocaleString("pt-BR", { month: "long" })
        .toLowerCase();
      return (
        t.type.toLowerCase().includes(term) ||
        t.description.toLowerCase().includes(term) ||
        (t.category ? t.category.toLowerCase().includes(term) : false) ||
        amountStr.includes(term) ||
        dateStr.includes(term) ||
        monthStr.includes(term)
      );
    });
    setFiltered(result);
  }, [all, search]);

  const supportsRealtime = useMemo(
    () => typeof repo.subscribeRecent === "function",
    [repo]
  );
  return {
    loading,
    transactions: filtered,
    search,
    setSearch,
    refresh,
    remove,
    update,
    supportsRealtime,
  };
}
