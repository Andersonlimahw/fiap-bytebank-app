# Firestore: Criando uma nova coleção com CRUD completo

Este tutorial mostra, em detalhes, como adicionar uma nova coleção Firestore ao ByteBank seguindo o padrão MVVM e usando `@react-native-firebase/firestore` em conjunto com o wrapper `FirebaseAPI`. Usaremos o exemplo fictício `Goals` (metas financeiras) para ilustrar cada passo.

## 1. Pré-requisitos

- Pacotes instalados: `@react-native-firebase/app` e `@react-native-firebase/firestore`.
- Projeto configurado no Firebase com Firestore habilitado e regras ajustadas.
- Ambiente pronto (`npm run start` funcionando sem mocks).

## 2. Expondo o Firestore na infraestrutura

O arquivo `src/infrastructure/firebase/firebase.ts` já cuida da inicialização (JS SDK). Para suportar React Native Firebase nos builds nativos sem quebrar o web, crie um helper `src/infrastructure/firebase/nativeFirestore.ts`:

```ts
// src/infrastructure/firebase/nativeFirestore.ts
import { Platform } from "react-native";
import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import {
  collection,
  doc,
  getFirestore,
} from "@react-native-firebase/firestore";
import { FirebaseAPI } from "./firebase";

export function getNativeFirestore():
  | FirebaseFirestoreTypes.Module
  | ReturnType<typeof getFirestore> {
  if (Platform.OS === "web") {
    // Mantém o SDK web no Expo web
    return FirebaseAPI.db;
  }
  return firestore();
}
```

> 📌 Não substitua imports existentes de `FirebaseAPI.db` imediatamente. Vá migrando os repositórios conforme necessário, sempre retornando o mesmo contrato (métodos `list`, `add`, `update`, `subscribe`).

## 3. Camada Domain

1. Crie a entidade `Goal` (`src/domain/entities/Goal.ts`):

   ```ts
   export type GoalStatus = "draft" | "active" | "completed";

   export interface Goal {
     id: string;
     userId: string;
     title: string;
     targetAmount: number; // em centavos
     deadline?: number; // timestamp
     status: GoalStatus;
     createdAt: number;
     updatedAt?: number;
   }
   ```

2. Defina o contrato do repositório (`src/domain/repositories/GoalRepository.ts`):

   ```ts
   import type { Goal } from "../entities/Goal";

   export interface GoalRepository {
     listByUser(userId: string): Promise<Goal[]>;
     getById(id: string): Promise<Goal | null>;
     create(
       data: Omit<Goal, "id" | "createdAt" | "updatedAt">
     ): Promise<string>;
     update(
       id: string,
       changes: Partial<Omit<Goal, "id" | "userId" | "createdAt">>
     ): Promise<void>;
     remove(id: string): Promise<void>;
     subscribe?(userId: string, cb: (goals: Goal[]) => void): () => void;
   }
   ```

3. Registre o novo token DI (`src/core/di/container.tsx`):

   ```ts
   import type { GoalRepository } from '@domain/repositories/GoalRepository';

   export const TOKENS = {
     ...
     GoalRepository: Symbol('GoalRepository') as Token<GoalRepository>,
   };
   ```

## 4. Camada Data (Firebase)

Crie `src/data/firebase/FirebaseGoalRepository.ts`:

```ts
import { Platform } from "react-native";
import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "@react-native-firebase/firestore";
import type { GoalRepository } from "@domain/repositories/GoalRepository";
import type { Goal } from "@domain/entities/Goal";
import { FirebaseAPI } from "../../infrastructure/firebase/firebase";

function mapSnap(docSnap: FirebaseFirestoreTypes.DocumentSnapshot | any): Goal {
  const data = docSnap.data();
  const createdAt = data.createdAt?.toMillis
    ? data.createdAt.toMillis()
    : Number(data.createdAt);
  const updatedAt = data.updatedAt?.toMillis
    ? data.updatedAt.toMillis()
    : Number(data.updatedAt) || undefined;
  return { id: docSnap.id, ...data, createdAt, updatedAt } as Goal;
}

export class FirebaseGoalRepository implements GoalRepository {
  private goalsCollection() {
    if (Platform.OS === "web") {
      return collection(FirebaseAPI.db, "goals");
    }
    return firestore().collection("goals");
  }

  async listByUser(userId: string): Promise<Goal[]> {
    if (Platform.OS === "web") {
      const q = query(
        this.goalsCollection() as any,
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      return snap?.docs?.map(mapSnap);
    }
    const snap = await (
      this.goalsCollection() as FirebaseFirestoreTypes.CollectionReference
    )
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();
    return snap?.docs?.map(mapSnap);
  }

  async getById(id: string): Promise<Goal | null> {
    if (Platform.OS === "web") {
      const ref = doc(FirebaseAPI.db, "goals", id);
      const snap = await getDoc(ref);
      return snap.exists() ? mapSnap(snap) : null;
    }
    const snap = await (
      this.goalsCollection() as FirebaseFirestoreTypes.CollectionReference
    )
      .doc(id)
      .get();
    return snap.exists ? mapSnap(snap) : null;
  }

  async create(
    data: Omit<Goal, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    if (Platform.OS === "web") {
      const created = await addDoc(this.goalsCollection() as any, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return created.id;
    }
    const created = await (
      this.goalsCollection() as FirebaseFirestoreTypes.CollectionReference
    ).add({
      ...data,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
    return created.id;
  }

  async update(
    id: string,
    changes: Partial<Omit<Goal, "id" | "userId" | "createdAt">>
  ): Promise<void> {
    if (Platform.OS === "web") {
      const ref = doc(FirebaseAPI.db, "goals", id);
      await updateDoc(ref, { ...changes, updatedAt: serverTimestamp() });
      return;
    }
    await (this.goalsCollection() as FirebaseFirestoreTypes.CollectionReference)
      .doc(id)
      .update({
        ...changes,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
  }

  async remove(id: string): Promise<void> {
    if (Platform.OS === "web") {
      const ref = doc(FirebaseAPI.db, "goals", id);
      await deleteDoc(ref);
      return;
    }
    await (this.goalsCollection() as FirebaseFirestoreTypes.CollectionReference)
      .doc(id)
      .delete();
  }

  subscribe(userId: string, cb: (goals: Goal[]) => void): () => void {
    if (Platform.OS === "web") {
      const q = query(
        this.goalsCollection() as any,
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      return onSnapshot(q, (snapshot) => cb(snapshot.docs.map(mapSnap)));
    }
    return (
      this.goalsCollection() as FirebaseFirestoreTypes.CollectionReference
    )
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .onSnapshot((snapshot) => cb(snapshot.docs.map(mapSnap)));
  }
}
```

> ✅ Mantenha a compatibilidade web/nativo. Use `Platform` para decidir entre `firestore()` e o SDK web.

## 5. Mock repository (opcional)

Para que `AppConfig.useMock` continue funcionando, adicione `src/data/mock/MockGoalRepository.ts`:

```ts
import type { GoalRepository } from "@domain/repositories/GoalRepository";
import type { Goal } from "@domain/entities/Goal";

export class MockGoalRepository implements GoalRepository {
  private byUser = new Map<string, Goal[]>();

  private ensure(userId: string) {
    if (!this.byUser.has(userId)) {
      this.byUser.set(userId, []);
    }
    return this.byUser.get(userId)!;
  }

  listByUser(userId: string): Promise<Goal[]> {
    return Promise.resolve(
      [...this.ensure(userId)].sort((a, b) => b.createdAt - a.createdAt)
    );
  }

  async getById(id: string): Promise<Goal | null> {
    for (const list of this.byUser.values()) {
      const found = list.find((goal) => goal.id === id);
      if (found) return { ...found };
    }
    return null;
  }

  async create(
    data: Omit<Goal, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    const id = `goal-${Math.random().toString(36).slice(2)}`;
    const now = Date.now();
    const full: Goal = { ...data, id, createdAt: now, updatedAt: now };
    const list = this.ensure(data.userId);
    list.unshift(full);
    return id;
  }

  async update(
    id: string,
    changes: Partial<Omit<Goal, "id" | "userId" | "createdAt">>
  ): Promise<void> {
    for (const [userId, list] of this.byUser.entries()) {
      const idx = list.findIndex((goal) => goal.id === id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...changes, updatedAt: Date.now() };
        this.byUser.set(userId, list);
        return;
      }
    }
  }

  async remove(id: string): Promise<void> {
    for (const [userId, list] of this.byUser.entries()) {
      const filtered = list.filter((goal) => goal.id !== id);
      if (filtered.length !== list.length) {
        this.byUser.set(userId, filtered);
        return;
      }
    }
  }

  subscribe(userId: string, cb: (goals: Goal[]) => void): () => void {
    const list = this.ensure(userId);
    cb([...list]);
    return () => void 0;
  }
}
```

## 6. Registrar no DI

Atualize `src/store/diStore.ts`:

```ts
import { FirebaseGoalRepository } from '../data/firebase/FirebaseGoalRepository';
import { MockGoalRepository } from '../data/mock/MockGoalRepository';

function buildContainer(): Container {
  const container = new Container();
  if (AppConfig.useMock) {
    ...
    container.set(TOKENS.GoalRepository, new MockGoalRepository());
    return container;
  }

  try {
    FirebaseAPI.ensureFirebase();
    ...
    container.set(TOKENS.GoalRepository, new FirebaseGoalRepository());
  } catch (error) {
    ...
    container.set(TOKENS.GoalRepository, new MockGoalRepository());
  }
  return container;
}
```

## 7. ViewModel

Crie `src/presentation/viewmodels/useGoalsViewModel.ts` inspirado em `useDigitalCardsViewModel.ts`:

```ts
import { useCallback, useEffect, useMemo, useState } from "react";
import { TOKENS } from "@core/di/container";
import { useDI } from "@store/diStore";
import { useAuth } from "@store/authStore";
import type { Goal } from "@domain/entities/Goal";
import type { GoalRepository } from "@domain/repositories/GoalRepository";

export function useGoalsViewModel() {
  const di = useDI();
  const repo = useMemo(
    () => di.resolve<GoalRepository>(TOKENS.GoalRepository),
    [di]
  );
  const { user } = useAuth();
  const [items, setItems] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const list = await repo.listByUser(user.id);
    setItems(list);
    setLoading(false);
  }, [repo, user]);

  const createGoal = useCallback(
    async (payload: Omit<Goal, "id" | "createdAt" | "updatedAt">) => {
      const id = await repo.create(payload);
      await refresh();
      return id;
    },
    [repo, refresh]
  );

  const updateGoal = useCallback(
    async (
      id: string,
      changes: Partial<Omit<Goal, "id" | "userId" | "createdAt">>
    ) => {
      await repo.update(id, changes);
      await refresh();
    },
    [repo, refresh]
  );

  const removeGoal = useCallback(
    async (id: string) => {
      await repo.remove(id);
      await refresh();
    },
    [repo, refresh]
  );

  useEffect(() => {
    if (!user) return;
    const unsub = repo.subscribe?.(user.id, (list) => {
      setItems(list);
      setLoading(false);
    });
    if (!unsub) refresh();
    return () => unsub?.();
  }, [repo, user, refresh]);

  return {
    items,
    loading,
    refresh,
    createGoal,
    updateGoal,
    removeGoal,
    user,
  } as const;
}
```

## 8. Screen e UI

1. Crie a pasta `src/presentation/screens/Goals` com `GoalsScreen.tsx` e `GoalsScreen.styles.ts`. Use `useGoalsViewModel` para renderizar, similar ao fluxo de cartões (`src/presentation/screens/Cards`).
2. Adicione a rota ao stack em `src/presentation/navigation/RootNavigator.tsx`:
   ```tsx
   <AppStack.Screen
     name="Goals"
     component={require("../screens/Goals/GoalsScreen").GoalsScreen}
     options={{ title: t("titles.goals") }}
   />
   ```
3. Crie strings em `src/presentation/i18n` (ex.: `src/presentation/i18n/locales/pt.ts`).

## 9. Testes manuais

- Execute `npm run start` e abra pelo Dev Client.
- Utilize a screen para criar/editar metas; valide no Firestore Console.
- Verifique se mudanças aparecem em tempo real em múltiplos dispositivos.

## 10. Índices e regras

- Se usar filtros múltiplos (`where` + `orderBy`), crie índices compostos pelo console (ver warning retornado pelo SDK).
- Atualize `firestore.rules` (se mantido no repositório) garantindo que o usuário só acesse documentos com o próprio `userId`.

## 11. Checklist final antes do PR

- [ ] Entidade, repositório, mock e tokens criados.
- [ ] ViewModel e screen conectados.
- [ ] Tests manuais passando (screens navegáveis, sem crashes).
- [ ] Regras e índices atualizados.
- [ ] Documentação (`docs/firebase/firestore.md`) revisada se algo mudou.

## Recursos úteis

- Firestore React Native Firebase — [https://rnfirebase.io/firestore/usage](https://rnfirebase.io/firestore/usage)
- Server timestamps — [https://firebase.google.com/docs/firestore/manage-data/add-data#server_time](https://firebase.google.com/docs/firestore/manage-data/add-data#server_time)
- Regras de segurança — [https://firebase.google.com/docs/firestore/security/rules-conditions](https://firebase.google.com/docs/firestore/security/rules-conditions)
