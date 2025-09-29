import type { AuthRepository } from "@domain/repositories/AuthRepository";
import type { User } from "@domain/entities/User";
import type { AuthProvider } from "@domain/entities/AuthProvider";

const demoUser: User = {
  id: "demo-user-1",
  name: "Demo User",
  email: "demo@bytebank.app",
  photoUrl: undefined,
};

export class MockAuthRepository implements AuthRepository {
  private user: User | null = demoUser; // start logged-in for convenience

  async getCurrentUser(): Promise<User | null> {
    return this.user;
  }

  onAuthStateChanged(cb: (user: User | null) => void): () => void {
    // Mock: no live events; just return noop and keep last state
    cb(this.user);
    return () => {};
  }

  async signIn(
    provider: AuthProvider,
    options?: { email?: string; password?: string }
  ): Promise<User> {
    if (provider === "anonymous") {
      this.user = { id: "anon-" + Date.now().toString(36), name: "Anonymous" };
      return this.user;
    }
    if (provider === "password") {
      const name = options?.email?.split("@")[0] || "User";
      this.user = {
        id: "pwd-" + Date.now().toString(36),
        name,
        email: options?.email,
      };
      return this.user;
    }
    // For other providers, just emulate a successful login
    this.user = {
      id: provider + "-" + Date.now().toString(36),
      name: provider.toUpperCase() + " User",
    };
    return this.user;
  }

  async signOut(): Promise<void> {
    this.user = null;
  }

  async signUp(options: { email: string; password: string }): Promise<User> {
    const name = options.email.split("@")[0] || "User";
    this.user = {
      id: "new-" + Date.now().toString(36),
      name,
      email: options.email,
    };
    return this.user;
  }
}
