import { Platform } from "react-native";
import { getApp } from "@react-native-firebase/app";
import { getFirestore } from "@react-native-firebase/firestore";
import { getStorage } from "@react-native-firebase/storage";
import AppConfig from "../../config/appConfig";

type FirebaseEnvConfig = {
  apiKey: string;
  authDomain?: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
};
const firebaseOptions: FirebaseEnvConfig = AppConfig.firebase;

function assertFirebaseConfig() {
  // Only required for Web. On native (iOS/Android) RNFB reads plist/json.
  if (Platform.OS === "web") {
    const requiredKeys: Array<keyof FirebaseEnvConfig> = [
      "apiKey",
      "projectId",
      "appId",
    ];
    for (const key of requiredKeys) {
      if (!firebaseOptions[key]) {
        throw new Error(
          `Firebase config missing ${key}. Check your EXPO_PUBLIC_FIREBASE_* envs.`
        );
      }
    }
  }
}

let appInstance: any | null = null;
let firestoreInstance: any | null = null;
let fireStorageInstance: any | null = null;

function ensureApp(): any {
  if (AppConfig.useMock) {
    console.log("Firebase disabled because AppConfig.useMock=true.");
    return null as any;
  }
  assertFirebaseConfig();

  // On native (iOS/Android), RNFB auto-initializes from GoogleService-Info.plist / google-services.json
  if (Platform.OS === "web") {
    return null as any;
  }

  if (!appInstance) {
    try {
      appInstance = getApp();
    } catch (e) {
      // If no native app available yet, leave null – callers using RNFB should ensure native setup is correct.
      appInstance = null;
    }
  }
  return appInstance;
}

async function ensureFirestore(): Promise<any> {
  if (firestoreInstance) return firestoreInstance;
  if (AppConfig.useMock) {
    console.log("Cannot initialize Firebase while running with mocks.");
    return null as any;
  }

  if (Platform.OS === "web") {
    // Use Web SDK only on web to avoid RNFB/Web mixing in native bundles
    const [{ initializeApp, getApps }, { initializeFirestore }] =
      await Promise.all([import("firebase/app"), import("firebase/firestore")]);
    const webApp = getApps()[0] ?? initializeApp(firebaseOptions as any);
    firestoreInstance = initializeFirestore(webApp, {
      experimentalForceLongPolling: true,
      useFetchStreams: false,
    } as any);
    return firestoreInstance;
  }

  // Native iOS/Android — use RNFB
  const nativeApp = ensureApp();
  firestoreInstance = nativeApp ? getFirestore(nativeApp) : getFirestore();
  return firestoreInstance;
}

// Provided only for legacy imports; this project does not require firebase/auth
// at runtime for Google Sign-In. Calling this will throw to make it explicit.
export function getFirebaseAuth(): any {
  // Auth via firebase/auth não é utilizado nesta build.
  // Mantemos a função para compatibilidade com imports legados.
  return null as any;
}

export async function initFirebase() {
  if (AppConfig.useMock) {
    console.log("Cannot initialize Firebase while running with mocks.");
    return { app: null as any, db: null as any };
  }
  const a = ensureApp();
  const db = await ensureFirestore();
  return { app: a, db };
}

export function getFirebaseApp(): any {
  return ensureApp();
}

export async function getFirestoreDb(): Promise<any> {
  return ensureFirestore();
}

export async function getFireStorage(): Promise<any> {
  if (fireStorageInstance) return fireStorageInstance;
  if (AppConfig.useMock) {
    console.log("Cannot initialize Firebase while running with mocks.");
    return null as any;
  }
  fireStorageInstance = getStorage();
  return fireStorageInstance;
}

export const FirebaseAPI = {
  ensureFirebase() {
    // fire-and-forget init (caller can optionally await initFirebase())
    void initFirebase();
  },
  get app(): any {
    return getFirebaseApp();
  },
  // For native callers expecting sync access, return RNFB instance immediately; on web, this will be a promise-aware getter via `getDb()` below.
  get db(): any {
    return firestoreInstance ?? ensureFirestore();
  },
  async getDb() {
    return ensureFirestore();
  },
  get storage() {
    return fireStorageInstance ?? getFireStorage();
  },
};

export type FirebaseService = typeof FirebaseAPI;
