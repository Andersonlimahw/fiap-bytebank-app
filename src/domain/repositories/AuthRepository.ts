import type { User } from '../entities/User';
import type { AuthProvider } from '../entities/AuthProvider';

export interface AuthRepository {
  getCurrentUser(): Promise<User | null>;
  onAuthStateChanged(cb: (user: User | null) => void): () => void;
  signIn(provider: AuthProvider, options?: { email?: string; password?: string }): Promise<User>;
  signUp(options: { email: string; password: string }): Promise<User>;
  signOut(): Promise<void>;
}
