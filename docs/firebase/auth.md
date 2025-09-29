# Autenticação com `@react-native-firebase/auth`

Este documento explica como integrar novos fluxos de autenticação no ByteBank, reutilizando o `AuthRepository` dentro da arquitetura MVVM. O projeto já fornece duas implementações:
- `GoogleAuthRepository` (`src/data/google/GoogleAuthRepository.ts`) — login via Google Sign-In (sem usar Firebase Auth diretamente).
- `FirebaseAuthRepository` (`src/data/firebase/FirebaseAuthRepository.ts`) — suporte a email/senha, anônimo e Google via Firebase Auth.

A seguir descrevemos como habilitar e estender `FirebaseAuthRepository` usando `@react-native-firebase/auth`.

## 1. Instalação e configuração
1. Instale o módulo:
   ```sh
   npm install @react-native-firebase/auth
   ```
2. Rode `npx expo prebuild` para gerar links nativos.
3. Atualize `ios/Podfile.lock` (executando `cd ios && pod install`).
4. No Firebase Console, ative os provedores necessários (Email/Password, Anonymous, Google, etc.).

## 2. Expondo a instância Auth
Crie um utilitário em `src/infrastructure/auth/firebaseAuth.ts`:

```ts
import { Platform } from 'react-native';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { getAuth as getWebAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import AppConfig from '../../config/appConfig';

let webAuth: ReturnType<typeof getWebAuth> | null = null;

export function getFirebaseAuthInstance(): FirebaseAuthTypes.Module | ReturnType<typeof getWebAuth> {
  if (Platform.OS === 'web') {
    if (!webAuth) {
      const app = initializeApp(AppConfig.firebase as any);
      webAuth = getWebAuth(app);
    }
    return webAuth;
  }
  return auth();
}
```

Atualize `src/infrastructure/auth/expoFirebaseAuth.ts` para reexportar `getFirebaseAuthInstance` e remover stubs se a implementação anterior não for mais necessária.

## 3. Atualizando `FirebaseAuthRepository`
Refatore `src/data/firebase/FirebaseAuthRepository.ts` para usar o helper:

```ts
import { getFirebaseAuthInstance } from '../../infrastructure/auth/firebaseAuth';
import auth, { firebase } from '@react-native-firebase/auth';

function mapUser(u: any): User {
  return {
    id: u.uid,
    name: u.displayName || 'User',
    email: u.email || undefined,
    photoUrl: u.photoURL || undefined,
  };
}

export class FirebaseAuthRepository implements AuthRepository {
  private auth = getFirebaseAuthInstance();

  async getCurrentUser(): Promise<User | null> {
    const user = this.auth.currentUser;
    return user ? mapUser(user) : null;
  }

  onAuthStateChanged(cb: (user: User | null) => void): () => void {
    return this.auth.onAuthStateChanged((user: any) => cb(user ? mapUser(user) : null));
  }

  async signIn(provider: AuthProvider, options?: { email?: string; password?: string }): Promise<User> {
    if (provider === 'password') {
      const result = await this.auth.signInWithEmailAndPassword(options?.email ?? '', options?.password ?? '');
      return mapUser(result.user);
    }
    if (provider === 'anonymous') {
      const result = await this.auth.signInAnonymously();
      return mapUser(result.user);
    }
    if (provider === 'google') {
      const { idToken, accessToken } = await GoogleSignin.signIn();
      const credential = auth.GoogleAuthProvider.credential(idToken, accessToken);
      const result = await this.auth.signInWithCredential(credential);
      return mapUser(result.user);
    }
    throw new Error(`Provider ${provider} não suportado`);
  }

  async signOut(): Promise<void> {
    await this.auth.signOut();
  }

  async signUp(options: { email: string; password: string }): Promise<User> {
    const result = await this.auth.createUserWithEmailAndPassword(options.email, options.password);
    return mapUser(result.user);
  }
}
```

> ℹ️ Para Google Sign-In em dispositivos nativos, continue usando `@react-native-google-signin/google-signin` para obter o `idToken` e troque pelo credential Firebase. No web, use `signInWithPopup` (adapte com `Platform.OS`).

## 4. Registrando o repositório correto
No `buildContainer` (`src/store/diStore.ts`), escolha qual implementação será usada:
```ts
if (AppConfig.useMock) {
  container.set(TOKENS.AuthRepository, new MockAuthRepository());
} else {
  // Prefira FirebaseAuthRepository se precisar de email/senha ou anonymous
  container.set(TOKENS.AuthRepository, new FirebaseAuthRepository());
  // Alternativa: use GoogleAuthRepository apenas quando quiser evitar Firebase Auth
}
```

## 5. Fluxos de UI e Store
- O Zustand `useAuthStore` (`src/store/authStore.ts`) já consome `AuthRepository`. Nenhuma mudança é necessária, desde que os métodos `signIn`, `signUp`, `signOut` e `onAuthStateChanged` sejam implementados.
- Para telas, confira `src/presentation/screens/Auth/LoginScreen.tsx` e `RegisterScreen.tsx`. Ajuste para coletar email/senha ou iniciar Google Sign-In conforme sua feature.
- Ao suportar múltiplos provedores, valide o `AuthProvider` vindo da UI (por exemplo, `password`, `google`, `anonymous`).

## 6. Configuração no Firebase Console
1. **Email/Password**: habilite e, opcionalmente, configure templates de email.
2. **Anonymous**: habilite apenas em ambientes controlados.
3. **Google**: informe o `Web client ID` e SHA-1/SH256 das builds.
4. **Apple**: se for habilitar, configure services ID e chave privada, e mapeie em `GoogleAuthProvider.credential`.

## 7. Testes e troubleshooting
- Use `npm run start` (Expo Dev Client) ou `npm run ios/android` para testar nativo.
- Em caso de erro `auth/network-request-failed`, confirme se o app tem conexão e se o domínio está autorizado.
- Verifique se `AppConfig.firebase` está completo; do contrário, a inicialização será bloqueada.
- Inspecione o Firebase Console → Authentication → Users para validar se os usuários estão sendo criados/atualizados.

## 8. Boas práticas
- Não exponha `auth()` diretamente nas views; utilize o repositório.
- Guarde metadados específicos em Firestore (ex.: perfil) para manter o Auth enxuto.
- Sincronize `displayName` e `photoURL` quando necessário (use `updateProfile`).
- Trate erros com feedback amigável (`auth/invalid-credential`, `auth/user-not-found`, etc.).

## Recursos
- React Native Firebase Auth — [https://rnfirebase.io/auth/usage](https://rnfirebase.io/auth/usage)
- Lista de erros Firebase Auth — [https://firebase.google.com/docs/auth/admin/errors](https://firebase.google.com/docs/auth/admin/errors)
- Google Sign-In com Firebase — [https://firebase.google.com/docs/auth/web/google-signin](https://firebase.google.com/docs/auth/web/google-signin)
