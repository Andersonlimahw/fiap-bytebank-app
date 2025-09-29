# Outros módulos React Native Firebase

Este arquivo consolida recomendações para módulos complementares que podem ser adicionados ao ByteBank. Cada seção descreve o objetivo, passos-chave e pontos de integração na arquitetura existente.

## 1. Cloud Messaging (FCM)
**Uso**: push notifications.

1. Instale pacotes:
   ```sh
   npm install @react-native-firebase/messaging expo-notifications
   npx expo prebuild --clean
   cd ios && pod install
   ```
2. Configuração nativa: atualize `android/app/src/main/AndroidManifest.xml` com permissões de push e `ios/` com `UserNotifications`.
3. Infraestrutura: crie `src/infrastructure/firebase/messaging.ts` com helpers para `messaging().getToken()` e listener de mensagens.
4. Domain/Data: defina `PushTokenRepository` caso precise sincronizar tokens no Firestore (`/users/{id}/pushTokens`).
5. Presentation: inicialize em `App.tsx` solicitando permissão e registrando callbacks.
6. Back-end: utilize Cloud Functions para enviar notificações.

Referências: [https://rnfirebase.io/messaging/usage](https://rnfirebase.io/messaging/usage)

## 2. Analytics
**Uso**: rastreamento de eventos e métricas.

1. Instale `@react-native-firebase/analytics`.
2. Crie `src/infrastructure/analytics/firebaseAnalytics.ts` expondo `logEvent`, `setUserId` etc.
3. Para manter coerência, defina um contrato `AnalyticsService` e injete via `TOKENS.AnalyticsService`.
4. Adapte `src/presentation/navigation/RootNavigator.tsx` para chamar `analytics().logScreenView` em `onStateChange`.

Referências: [https://rnfirebase.io/analytics/usage](https://rnfirebase.io/analytics/usage)

## 3. Remote Config
**Uso**: feature flags e ajustes dinâmicos.

1. Instale `@react-native-firebase/remote-config`.
2. Crie `src/infrastructure/firebase/remoteConfig.ts` com funções `fetchAndActivate`, `getBoolean`, etc.
3. Mapeie os valores para um serviço `ConfigService` e injete no DI.
4. Utilize o serviço no `App.tsx` (ou em um hook) para carregar valores antes de renderizar screens críticas.

Referências: [https://rnfirebase.io/remote-config/usage](https://rnfirebase.io/remote-config/usage)

## 4. Crashlytics
**Uso**: monitoramento de crashes.

1. Instale `@react-native-firebase/crashlytics`.
2. Configure na infraestrutura (`src/infrastructure/firebase/crashlytics.ts`) expondo `log`, `recordError`.
3. Capture erros globais com `ErrorUtils` ou `expo-dev-client` (`App.tsx`).
4. Opcionalmente, envie logs adicionais a cada ação importante nas ViewModels.

Referências: [https://rnfirebase.io/crashlytics/usage](https://rnfirebase.io/crashlytics/usage)

## 5. Performance Monitoring
**Uso**: métricas de latência e uso de rede.

1. Instale `@react-native-firebase/perf`.
2. Crie um helper para iniciar traces (`perf().newTrace('fetch_transactions')`).
3. Utilize nas camadas Data (ex.: envolver chamada Firestore) para medir tempo de resposta.

Referências: [https://rnfirebase.io/perf/usage](https://rnfirebase.io/perf/usage)

## Boas práticas gerais
- Centralize cada módulo em `src/infrastructure/firebase` e exponha apenas interfaces amigáveis para ViewModels.
- Mantenha tokens/new services registrados no DI (`TOKENS`) para facilitar troca por mocks.
- Desative coleta de dados sensíveis em builds de desenvolvimento (`analytics().setAnalyticsCollectionEnabled(false)` etc.).
- Atualize a documentação sempre que novos módulos forem adicionados ou configurados.
