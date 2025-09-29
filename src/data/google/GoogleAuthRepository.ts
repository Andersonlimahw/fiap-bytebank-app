import type { AuthRepository } from "@domain/repositories/AuthRepository";
import type { User } from "@domain/entities/User";
import type { AuthProvider } from "@domain/entities/AuthProvider";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import Constants from "expo-constants";

type Listener = (user: User | null) => void;

function mapGoogleUser(googleUser: any | null): User | null {
  if (!googleUser) return null;
  const user = googleUser.data.user || googleUser.data;
  if (!user) return null;

  const userId = user.id || user.uid;
  if (!userId) {
    console.error("Google user object is missing an ID.", user);
    return null;
  }

  return {
    ...user,
    id: String(userId),
    name: String(user.name || "User"),
    email: user.email ?? undefined,
    photoUrl: user.photo ?? user.photoURL ?? undefined,
  };
}

export class GoogleAuthRepository implements AuthRepository {
  private listeners = new Set<Listener>();
  private current: User | null = null;

  constructor() {
    // Configure Google Sign-In once with available client IDs.
    const extra = (Constants.expoConfig?.extra ?? {}) as Record<
      string,
      string | undefined
    >;
    try {
      GoogleSignin.configure({
        // These are optional; config plugin wires native parts.
        webClientId: extra.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        iosClientId: extra.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        offlineAccess: false,
      });
    } catch {}
  }

  private notify() {
    for (const cb of this.listeners) {
      try {
        cb(this.current);
      } catch {}
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const isSignedIn = await GoogleSignin.isSignedIn();
      if (!isSignedIn) return null;

      const info = await GoogleSignin.getCurrentUser();
      this.current = mapGoogleUser(info);

      return this.current;
    } catch {
      return null;
    }
  }

  onAuthStateChanged(cb: (user: User | null) => void): () => void {
    this.listeners.add(cb);
    // Emit resolved value once (ensures we read persisted session on startup)
    this.getCurrentUser()
      .then((u) => {
        try {
          cb(u);
        } catch {}
      })
      .catch(() => {
        try {
          cb(null);
        } catch {}
      });
    return () => this.listeners.delete(cb);
  }

  async signIn(provider: AuthProvider): Promise<User> {
    if (provider !== "google") {
      throw new Error(
        `Provider ${provider} não suportado por GoogleAuthRepository`
      );
    }
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
    const user = mapGoogleUser(response);
    if (!user) throw new Error("Falha no login com Google");
    this.current = user;
    this.notify();
    return user;
  }

  async signOut(): Promise<void> {
    try {
      await GoogleSignin.signOut();
    } finally {
      this.current = null;
      this.notify();
    }
  }

  async signUp(): Promise<User> {
    // Não aplicável para Google Sign-In puro
    throw new Error("SignUp não suportado com GoogleAuthRepository");
  }
}
