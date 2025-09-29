# Guia de Integração Firebase no ByteBank

Este guia reúne a visão geral da arquitetura Firebase utilizada no projeto `bytebank-app` e aponta para tutoriais específicos de cada módulo do **React Native Firebase**. O conteúdo foi escrito para quem precisa evoluir o app seguindo o padrão **MVVM + camadas Domain/Data/Presentation** já adotado no código fonte.

> ⚠️ Sempre verifique se `AppConfig.useMock` está `false` (`src/config/appConfig.ts`) antes de consumir os serviços reais. Em modo mock, os repositórios Firebase não são carregados.

## Sumário rápido
- [Configuração base (`@react-native-firebase/app`)](#configuracao-base)
- [Arquitetura usada pelo app](#arquitetura-usada-pelo-app)
- [Checklist de ambiente](#checklist-de-ambiente)
- [Fluxo para criar uma nova coleção Firestore](#fluxo-para-nova-colecao-firestore)
- [Documentações detalhadas por módulo](#documentacoes-por-modulo)
- [Boas práticas gerais](#boas-praticas)
- [Recursos oficiais](#referencias)

## Configuração base
1. Instale os pacotes mínimos:
   ```sh
   npm install @react-native-firebase/app @react-native-firebase/firestore \
               @react-native-firebase/auth @react-native-firebase/storage \
               @react-native-firebase/database
   ```
   > O projeto já usa o SDK web do Firebase para rodar no Expo web. Os pacotes `@react-native-firebase/*` serão usados em build nativa (Android/iOS). Mantenha ambos instalados.

2. Registre os apps nativos no Firebase Console e baixe os arquivos de configuração:
   - `google-services.json` → coloque na raiz do repositório e referencie em `app.json` (`android.googleServicesFile`).
   - `GoogleService-Info.plist` → idem para iOS (`ios.googleServicesFile`).

3. Expo prebuild: ao gerar a build nativa, os plugins de `@react-native-firebase/*` devem estar ativos. Confirme executando:
   ```sh
   npx expo prebuild --clean
   npx expo config --json | jq '.mods.android-versions | keys'
   ```
   Verifique se `withAndroidFirebaseApp` (ou similar) aparece. Caso contrário, adicione manualmente ao `app.plugin.js`.

4. Variáveis de ambiente: o arquivo `src/config/appConfig.ts` lê valores com prefixo `EXPO_PUBLIC_`. Garanta que seu `.env` tenha, no mínimo:
   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=...
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
   EXPO_PUBLIC_FIREBASE_APP_ID=...
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   EXPO_PUBLIC_FIREBASE_DATABASE_URL=...
   ```

## Arquitetura usada pelo app
O projeto segue um layout MVVM desacoplado por camadas:

| Camada | Local | Responsabilidade |
| --- | --- | --- |
| **Domain** | `src/domain` | Modelos de negócio e contratos (`entities`, `repositories`). |
| **Data** | `src/data` | Implementações dos repositórios (Firebase, mocks, integrações externas). |
| **Infrastructure** | `src/infrastructure` | Inicialização de SDKs, conexão com Firebase, serviços low-level. |
| **Presentation** | `src/presentation` | ViewModels (`viewmodels`), hooks e screens consumidores dos repositórios. |
| **Store** | `src/store` | Gestão de estado (Zustand) e DI container (`diStore`). |

O ponto central para resolver dependências é o arquivo `src/store/diStore.ts`, que instancia os repositórios reais ou mocks e os expõe via `TOKENS` (`src/core/di/container.tsx`).

## Checklist de ambiente
Antes de começar qualquer desenvolvimento com Firebase:
- [ ] Confirme login no Firebase CLI (`firebase login`).
- [ ] Ative os módulos desejados no console (Firestore, Realtime Database, Storage etc.) e configure as regras.
- [ ] Atualize os arquivos de ambiente e rode `npm run start` para garantir que não há erros de inicialização.
- [ ] No iOS, execute `cd ios && pod install` após instalar novos módulos nativos.

## Fluxo para nova coleção Firestore
O passo a passo completo está em [`docs/firebase/firestore.md`](./firestore.md). O resumo das etapas é:
1. **Domain**: crie a entidade e o contrato do repositório.
2. **Data/Firebase**: implemente o repositório usando `@react-native-firebase/firestore` ou o SDK web (para web builds).
3. **Data/Mock**: forneça uma alternativa em memória para `AppConfig.useMock === true`.
4. **DI**: cadastre o repositório novo em `TOKENS` e em `useDIStore`.
5. **Presentation**: escreva o ViewModel (`src/presentation/viewmodels`) e a screen/hook que o consome.
6. **Outros ajustes**: traduções (`src/presentation/i18n`), navegação e testes.

## Documentações por módulo
- [`docs/firebase/firestore.md`](./firestore.md) — CRUD completo de coleções, índices e listeners em tempo real.
- [`docs/firebase/auth.md`](./auth.md) — Login com `@react-native-firebase/auth`, integração com OAuth e store de autenticação.
- [`docs/firebase/storage.md`](./storage.md) — Upload/download de arquivos, regras e cache local.
- [`docs/firebase/database.md`](./database.md) — Realtime Database com streams e sincronização offline.
- [`docs/firebase/other-modules.md`](./other-modules.md) — Push notifications (Messaging), Remote Config, Analytics e Crashlytics.

## Boas práticas
- Centralize cada acesso em um repositório; evite chamar `firestore()` diretamente nas screens.
- Nunca exponha a instância nativa fora da camada `infrastructure`.
- Utilize `serverTimestamp()` para campos auditáveis (`createdAt`, `updatedAt`).
- Garanta que todo listener (`onSnapshot`, `onValue`) retorne `unsubscribe` para evitar memory leaks.
- Valide dados antes de escrever no Firebase para reduzir regras complexas.
- Ajuste `experimentalForceLongPolling` apenas quando necessário (já tratado em `expoFirebaseApp.ts`).

## Referências
- React Native Firebase — [https://rnfirebase.io](https://rnfirebase.io)
- Firestore — [https://firebase.google.com/docs/firestore](https://firebase.google.com/docs/firestore)
- Firebase Auth — [https://firebase.google.com/docs/auth](https://firebase.google.com/docs/auth)
- Firebase Storage — [https://firebase.google.com/docs/storage](https://firebase.google.com/docs/storage)
- Realtime Database — [https://firebase.google.com/docs/database](https://firebase.google.com/docs/database)
- Guia oficial Expo + Firebase — [https://docs.expo.dev/guides/using-firebase/](https://docs.expo.dev/guides/using-firebase/)
