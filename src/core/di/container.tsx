import type { AuthRepository } from "@app/domain/repositories/AuthRepository";
import type { TransactionRepository } from "@app/domain/repositories/TransactionRepository";
import type { InvestmentRepository } from "@app/domain/repositories/InvestmentRepository";
import type { PixRepository } from "@app/domain/repositories/PixRepository";
import type { CardRepository } from "@app/domain/repositories/CardRepository";
import type { QuoteRepository } from "@app/data/b3/B3QuoteRepository";
import type { CurrencyRepository } from "@app/domain/repositories/CurrencyRepository";
import type { FileRepository } from "@app/domain/repositories/FileRepository";

export type Token<T> = symbol & { __type?: T };

export class Container {
  private registry = new Map<symbol, unknown>();

  set<T>(token: Token<T>, value: T) {
    this.registry.set(token, value as unknown);
  }

  get<T>(token: Token<T>): T {
    if (!this.registry.has(token)) {
      console.warn(`DI: token not registered: ${String(token)}`);
      // throw new Error(`DI: token not registered: ${String(token)}`);
    }
    return this.registry.get(token) as T;
  }
}

// Simple DI facade used by viewmodels
export type DI = { resolve<T>(token: Token<T>): T };

export const TOKENS = {
  AuthRepository: Symbol("AuthRepository") as Token<AuthRepository>,
  TransactionRepository: Symbol(
    "TransactionRepository"
  ) as Token<TransactionRepository>,
  InvestmentRepository: Symbol(
    "InvestmentRepository"
  ) as Token<InvestmentRepository>,
  QuoteRepository: Symbol("QuoteRepository") as Token<QuoteRepository>,
  PixRepository: Symbol("PixRepository") as Token<PixRepository>,
  CardRepository: Symbol("CardRepository") as Token<CardRepository>,
  CurrencyRepository: Symbol("CurrencyRepository") as Token<CurrencyRepository>,
  FileRepository: Symbol("FileRepository") as Token<FileRepository>,
};

export function createDI(container: Container): DI {
  return {
    resolve<T>(token: Token<T>): T {
      return container.get(token);
    },
  };
}
