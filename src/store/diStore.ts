import { create } from "zustand";
import { devtools } from "zustand/middleware";
import AppConfig from "@app/config/appConfig";
import { FirebaseAPI } from "@app/infrastructure/firebase/firebase";
import { Container, TOKENS, createDI, type DI } from "@app/core/di/container";
import { MockAuthRepository } from "@app/data/mock/MockAuthRepository";
import { MockTransactionRepository } from "@app/data/mock/MockTransactionRepository";
import { MockInvestmentRepository } from "@app/data/mock/MockInvestmentRepository";
import { GoogleAuthRepository as FirebaseAuthRepository } from "@app/data/google/GoogleAuthRepository";
import { FirebaseTransactionRepository } from "@app/data/firebase/FirebaseTransactionRepository";
import { FirebaseInvestmentRepository } from "@app/data/firebase/FirebaseInvestmentRepository";
import { B3QuoteRepository } from "@app/data/b3/B3QuoteRepository";
import { AwesomeCurrencyRepository } from "@app/data/currency/AwesomeCurrencyRepository";
import { FirebasePixRepository } from "@app/data/firebase/FirebasePixRepository";
import { FirebaseCardRepository } from "@app/data/firebase/FirebaseCardRepository";
import { MockPixRepository } from "@app/data/mock/MockPixRepository";
import { MockCardRepository } from "@app/data/mock/MockCardRepository";
import { MockFileRepository } from "@app/data/mock/MockFileRepository";
import { FirebaseFileRepository } from "@app/data/firebase/FirebaseFileRepository";

type DIState = {
  container: Container;
  di: DI;
};

function buildContainer(): Container {
  const container = new Container();
  // Public API repositories are the same for both modes
  container.set(TOKENS.QuoteRepository, new B3QuoteRepository());
  container.set(TOKENS.CurrencyRepository, new AwesomeCurrencyRepository());

  if (AppConfig.useMock) {
    container.set(TOKENS.AuthRepository, new MockAuthRepository());
    container.set(
      TOKENS.TransactionRepository,
      new MockTransactionRepository()
    );
    container.set(TOKENS.InvestmentRepository, new MockInvestmentRepository());
    container.set(TOKENS.PixRepository, new MockPixRepository());
    container.set(TOKENS.CardRepository, new MockCardRepository());
    container.set(TOKENS.FileRepository, new MockFileRepository());
    return container;
  }

  // In real mode, try to init Firebase; if it fails, gracefully fallback to mocks
  try {
    FirebaseAPI.ensureFirebase();
    // Autenticação via GoogleSignin (sem firebase/auth)
    container.set(TOKENS.AuthRepository, new FirebaseAuthRepository());
    container.set(
      TOKENS.TransactionRepository,
      new FirebaseTransactionRepository()
    );
    container.set(
      TOKENS.InvestmentRepository,
      new FirebaseInvestmentRepository()
    );
    container.set(TOKENS.PixRepository, new FirebasePixRepository());
    container.set(TOKENS.CardRepository, new FirebaseCardRepository());
    container.set(TOKENS.FileRepository, new FirebaseFileRepository());
  } catch (e: any) {
    // Keep the app usable in development if Firebase env is missing/misconfigured
    // eslint-disable-next-line no-console
    console.warn("[DI] Firebase init failed, using mocks instead:", {
      error: e,
    });
    container.set(TOKENS.AuthRepository, new MockAuthRepository());
    container.set(
      TOKENS.TransactionRepository,
      new MockTransactionRepository()
    );
    container.set(TOKENS.InvestmentRepository, new MockInvestmentRepository());
    container.set(TOKENS.PixRepository, new MockPixRepository());
    container.set(TOKENS.CardRepository, new MockCardRepository());
  }
  return container;
}

const container = buildContainer();
const di = createDI(container);

export const useDIStore = create<DIState>()(
  devtools(() => ({ container, di }), { name: "DI" })
);

export function useDI(): DI {
  type S = ReturnType<typeof useDIStore.getState>;
  return useDIStore((s: S) => s.di);
}
