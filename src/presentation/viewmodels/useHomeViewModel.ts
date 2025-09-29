import { useCallback, useEffect, useMemo, useState } from "react";
import { useDI } from "@store/diStore";
import { TOKENS } from "@core/di/container";
import type { Transaction } from "@domain/entities/Transaction";
import type { TransactionRepository } from "@domain/repositories/TransactionRepository";
import { useAuth } from "@store/authStore";
import { GetRecentTransactions } from "../../application/usecases/GetRecentTransactions";
import { GetBalance } from "../../application/usecases/GetBalance";

export function useHomeViewModel() {
  const di = useDI();
  const txRepo = useMemo(
    () => di.resolve<TransactionRepository>(TOKENS.TransactionRepository),
    [di]
  );
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const getRecentUC = useMemo(
    () => new GetRecentTransactions(txRepo),
    [txRepo]
  );
  const getBalanceUC = useMemo(() => new GetBalance(txRepo), [txRepo]);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [txs, bal] = await Promise.all([
      getRecentUC.execute(user.id, 10),
      getBalanceUC.execute(user.id),
    ]);
    setTransactions(txs);
    setBalance(bal);
    setLoading(false);
  }, [getRecentUC, getBalanceUC, user]);

  useEffect(() => {
    if (!user) return;
    if (typeof txRepo.subscribeRecent === "function") {
      setLoading(true);
      const unsub = txRepo.subscribeRecent(user.id, 10, (txs) => {
        setTransactions(txs);
        const bal = txs?.reduce(
          (acc, t) => acc + (t.type === "credit" ? t.amount : -t.amount),
          0
        );
        setBalance(bal);
        setLoading(false);
      });
      return () => unsub();
    }
    let mounted = true;
    (async () => {
      if (!mounted) return;
      await refresh();
    })();
    return () => {
      mounted = false;
    };
  }, [txRepo, user, refresh]);

  return { loading, transactions, balance, refresh };
}
