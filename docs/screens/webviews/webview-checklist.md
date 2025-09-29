# WebView Wrapper — Checklist de Execução

- [ ] Instalar dependência `react-native-webview` com `npx expo install react-native-webview`.
- [ ] (Se bare/dev-client) Rodar `npx expo prebuild` e `cd ios && pod install`.
- [ ] Tipar rota `WebView` em `src/presentation/navigation/types.ts` (params conforme doc).
- [ ] Criar `src/presentation/screens/WebView/WebViewScreen.tsx` com montagem de URL e validações.
- [ ] Registrar rota no `AppStack` em `src/presentation/navigation/RootNavigator.tsx`.
- [ ] Validar tema/i18n no header (título, cores, ações).
- [ ] (Opcional) Adicionar Linking config em `App.tsx` para `bytebank://webview`.
- [ ] iOS: revisar ATS em `app.json` (`ios.infoPlist.NSAppTransportSecurity`) caso use HTTP/domínios não-padrão.
- [ ] Android: decidir sobre `mixedContentMode` (evitar; só se necessário HTTP).
- [ ] Testar em Android (hardware back) e iOS (gestos de navegação).
- [ ] Validar whitelist `allowDomains` e abertura externa segura.
- [ ] Validar comunicação via `postMessage` (se aplicável).

```mermaid
checklist
  title WebView Wrapper — Execução
  section Dependências
    Instalar react-native-webview: done
    Prebuild/Pods (se bare): todo
  section Código
    Tipar rota WebView: todo
    Criar WebViewScreen.tsx: todo
    Registrar no RootNavigator: todo
  section Plataforma
    iOS ATS revisado: todo
    Android mixed content: todo
  section Testes
    Android back handler: todo
    iOS navegação/gestos: todo
```

