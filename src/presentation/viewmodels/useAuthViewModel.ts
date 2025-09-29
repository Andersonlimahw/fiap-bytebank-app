import { useAuth } from "@store/authStore";
import type { AuthProvider } from "@domain/entities/AuthProvider";

// Backwards-compatible viewmodel wrapper over Zustand store
export function useAuthViewModel() {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  return {
    initializing: loading,
    user,
    signIn: (
      provider: AuthProvider,
      options?: { email?: string; password?: string }
    ) => signIn(provider, options),
    signOut,
    signUp,
  } as const;
}
