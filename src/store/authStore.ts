import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { devtools, persist, createJSONStorage } from "zustand/middleware";

import type { User } from "../domain/entities/User";
import type { AuthRepository } from "../domain/repositories/AuthRepository";
import type { AuthProvider } from "../domain/entities/AuthProvider";

import { TOKENS } from "../core/di/container";
import { useDIStore } from "./diStore";

type AuthState = {
  isHydrated: boolean;
  isAuthenticated: () => boolean;
  setPartialProfile: (partial: Partial<User>) => void;
  user: User | null | undefined; // undefined while initializing
  loading: boolean;
  signIn: (
    provider: AuthProvider,
    options?: { email?: string; password?: string }
  ) => Promise<void>;
  signUp: (options: { email: string; password: string }) => Promise<void>;
  signInAnonymously: () => Promise<void>;
  signOut: () => Promise<void>;
};

type PersistShape = {
  user: AuthState["user"] | null;
  _persistVersion: number; // para migrations
};

let initialized = false;
let unsubscribe: (() => void) | undefined;

const STORAGE_KEY = "@bytebank-app/auth:v2";
const STORAGE_VERSION = 2;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isHydrated: false,

      user: undefined,
      loading: true,
      async signIn(
        provider: AuthProvider,
        options?: { email?: string; password?: string }
      ) {
        const repo = useDIStore
          .getState()
          .di.resolve<AuthRepository>(TOKENS.AuthRepository);
        set({ loading: true });
        try {
          const providerResult = await repo.signIn(provider, options);
          set({ user: providerResult });
        } catch (e: any) {
          console.error("[authStore] signIn error", e);
        } finally {
          set({ loading: false });
        }
      },
      setPartialProfile(patch) {
        const user = get().user;
        if (!user) return;
        set({ user: { ...user, ...patch } });
      },
      async signUp(options: { email: string; password: string }) {
        const repo = useDIStore
          .getState()
          .di.resolve<AuthRepository>(TOKENS.AuthRepository);
        set({ loading: true });
        try {
          await repo.signUp(options);
          const u = await repo.getCurrentUser();
          set({ user: u });
        } finally {
          set({ loading: false });
        }
      },
      async signInAnonymously() {
        const repo = useDIStore
          .getState()
          .di.resolve<AuthRepository>(TOKENS.AuthRepository);
        set({ loading: true });
        try {
          await repo.signIn("anonymous");
          const u = await repo.getCurrentUser();
          set({ user: u });
        } finally {
          set({ loading: false });
        }
      },
      async signOut() {
        const repo = useDIStore
          .getState()
          .di.resolve<AuthRepository>(TOKENS.AuthRepository);
        set({ loading: true });
        try {
          await repo.signOut();
          set({ user: null });
        } finally {
          set({ loading: false });
        }
      },
      isAuthenticated: () => !!get().user,
    }),
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state): PersistShape => {
        return {
          user: state.user,
          _persistVersion: STORAGE_VERSION,
        };
      },
      onRehydrateStorage: (state) => {
        state &&
          state.isHydrated == false &&
          state &&
          (state.isHydrated = true);
      },
      migrate: async (persisted, version) => {
        if (!persisted) return persisted;
        if (version === 1) {
          return {
            ...persisted,
            _persistVersion: STORAGE_VERSION,
          };
        }
        return persisted;
      },
    }
  )
);

export async function initAuthStore() {
  if (initialized) return;
  initialized = true;
  const repo = useDIStore
    .getState()
    .di.resolve<AuthRepository>(TOKENS.AuthRepository);
  try {
    const u = await repo.getCurrentUser();
    useAuthStore.setState({ user: u });
  } finally {
    useAuthStore.setState({ loading: false });
    unsubscribe = repo.onAuthStateChanged((u: User | null) => {
      try {
        useAuthStore.setState({ user: u });
      } catch (error) {
        console.error("[authStore] Failed to handle auth state change:", error);
      }
    });
  }
}

export function teardownAuthStore() {
  if (unsubscribe) unsubscribe();
  unsubscribe = undefined;
  initialized = false;
}

// Convenience typed selector hook, Redux-like ergonomics
export function useAuth() {
  type S = ReturnType<typeof useAuthStore.getState>;
  const user = useAuthStore((s: S) => s.user);
  const loading = useAuthStore((s: S) => s.loading);
  const signIn = useAuthStore((s: S) => s.signIn);
  const signUp = useAuthStore((s: S) => s.signUp);
  const signInAnonymously = useAuthStore((s: S) => s.signInAnonymously);
  const signOut = useAuthStore((s: S) => s.signOut);
  const setPartialProfile = useAuthStore((s) => s.setPartialProfile);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return {
    user,
    loading,
    signIn,
    signUp,
    signInAnonymously,
    signOut,
    isHydrated,
    isAuthenticated,
    setPartialProfile,
  } as const;
}
