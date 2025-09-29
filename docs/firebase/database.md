# Realtime Database (`@react-native-firebase/database`)

Use este guia quando precisar consumir dados em tempo real que não se encaixam no modelo de documentos do Firestore. O exemplo usa um feed de notificações instantâneas associado ao usuário (`/realtimeNotifications/{userId}`).

## 1. Dependências

```sh
npm install @react-native-firebase/database
npx expo prebuild --clean
cd ios && pod install
```

Ative o Realtime Database no console e escolha o modo `Locked Mode`. Defina regras coerentes com o padrão de `userId`.

## 2. Domain

1. Entidade `RealtimeNotification` (`src/domain/entities/RealtimeNotification.ts`):

   ```ts
   export interface RealtimeNotification {
     id: string;
     userId: string;
     kind: "transaction" | "goal" | "system";
     payload: Record<string, unknown>;
     createdAt: number;
     readAt?: number;
   }
   ```

2. Repositório (`src/domain/repositories/RealtimeNotificationRepository.ts`):

   ```ts
   export interface RealtimeNotificationRepository {
     listen(
       userId: string,
       cb: (items: RealtimeNotification[]) => void
     ): () => void;
     markAsRead(userId: string, notificationId: string): Promise<void>;
     push(
       userId: string,
       notification: Omit<RealtimeNotification, "id" | "createdAt">
     ): Promise<string>;
   }
   ```

3. Registre o token em `src/core/di/container.tsx`.

## 3. Data (Firebase)

Crie `src/data/firebase/RealtimeNotificationRepository.ts`:

```ts
import database from "@react-native-firebase/database";
import { getDatabase, ref, onValue, push, update } from "firebase/database";
import { Platform } from "react-native";
import type { RealtimeNotificationRepository } from "@domain/repositories/RealtimeNotificationRepository";
import type { RealtimeNotification } from "@domain/entities/RealtimeNotification";
import AppConfig from "../../config/appConfig";

function path(userId: string) {
  return `/realtimeNotifications/${userId}`;
}

export class FirebaseRealtimeNotificationRepository
  implements RealtimeNotificationRepository
{
  private nativeDb = database();

  private webDb() {
    return getDatabase();
  }

  listen(
    userId: string,
    cb: (items: RealtimeNotification[]) => void
  ): () => void {
    if (Platform.OS === "web") {
      const dbRef = ref(this.webDb(), path(userId));
      const unsubscribe = onValue(dbRef, (snap) => {
        const value = snap.val() ?? {};
        const items = Object.entries(value).map(
          ([key, raw]: [string, any]) => ({
            id: key,
            userId,
            ...raw,
            createdAt: Number(raw.createdAt) || Date.now(),
          })
        );
        cb(items.sort((a, b) => b.createdAt - a.createdAt));
      });
      return () => unsubscribe();
    }

    const dbRef = this.nativeDb.ref(path(userId));
    const listener = dbRef.on("value", (snapshot) => {
      const value = snapshot.val() ?? {};
      const items = Object.entries(value).map(([key, raw]) => ({
        id: key,
        userId,
        ...raw,
        createdAt: Number(raw.createdAt) || Date.now(),
      }));
      cb(items.sort((a, b) => b.createdAt - a.createdAt));
    });
    return () => dbRef.off("value", listener);
  }

  async push(
    userId: string,
    notification: Omit<RealtimeNotification, "id" | "createdAt">
  ): Promise<string> {
    const payload = {
      ...notification,
      createdAt: Date.now(),
    };
    if (Platform.OS === "web") {
      const result = await push(ref(this.webDb(), path(userId)), payload);
      return result.key!;
    }
    const result = await this.nativeDb.ref(path(userId)).push(payload);
    return result.key as string;
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    const updatePath = `${path(userId)}/${notificationId}`;
    if (Platform.OS === "web") {
      await update(ref(this.webDb(), updatePath), { readAt: Date.now() });
      return;
    }
    await this.nativeDb.ref(updatePath).update({ readAt: Date.now() });
  }
}
```

## 4. Mock

Implemente `src/data/mock/MockRealtimeNotificationRepository.ts` anotando listeners em memória, emitindo mudanças com `setTimeout` para simular tempo real.

## 5. Registro e ViewModel

1. Atualize `buildContainer` (`src/store/diStore.ts`) para registrar `TOKENS.RealtimeNotificationRepository` com a implementação real ou mock.
2. Crie `useRealtimeNotificationsViewModel`:

   ```ts
   export function useRealtimeNotificationsViewModel() {
     const di = useDI();
     const repo = useMemo(
       () =>
         di.resolve<RealtimeNotificationRepository>(
           TOKENS.RealtimeNotificationRepository
         ),
       [di]
     );
     const { user } = useAuth();
     const [items, setItems] = useState<RealtimeNotification[]>([]);

     useEffect(() => {
       if (!user) return;
       const unsubscribe = repo.listen(user.id, setItems);
       return () => unsubscribe();
     }, [repo, user]);

     const markAsRead = useCallback(
       async (id: string) => {
         if (user) await repo.markAsRead(user.id, id);
       },
       [repo, user]
     );

     return { items, markAsRead } as const;
   }
   ```

3. Conecte o ViewModel em um componente (por exemplo `src/presentation/screens/Home/components/NotificationBell.tsx`) exibindo badge em tempo real.

## 6. Segurança e regras

Exemplo de regra minimalista (`Firebase Console → Realtime Database → Rules`):

```json
{
  "rules": {
    "realtimeNotifications": {
      "$userId": {
        ".read": "auth != null && auth.uid === $userId",
        ".write": "auth != null && auth.uid === $userId"
      }
    }
  }
}
```

## 7. Boas práticas

- Normalize dados: mantenha registros pequenos (<= 256KB) para evitar problemas em `onValue`.
- Prefira `child_added`, `child_changed` quando precisar de streaming incremental.
- Combine Realtime Database com Firestore quando precisar de histórico persistente (salve uma cópia em Firestore via Cloud Function).
- Desligue listeners em `useEffect` para não deixar conexões abertas.

## Recursos

- React Native Firebase Database — [https://rnfirebase.io/database/usage](https://rnfirebase.io/database/usage)
- Regras Realtime Database — [https://firebase.google.com/docs/database/security](https://firebase.google.com/docs/database/security)
- Limites e performance — [https://firebase.google.com/docs/database/usage/limits](https://firebase.google.com/docs/database/usage/limits)
