# WebView Wrapper — Troubleshooting

## Erros comuns

- Tela em branco no iOS:
  - Verifique ATS (App Transport Security). Garanta `https` ou adicione exceção no `app.json` → `ios.infoPlist.NSAppTransportSecurity`.
  - Confirme se a URL final está correta (logar `finalUrl`).

- Links externos não abrem:
  - Por padrão, domínios fora da whitelist abrem no navegador externo via `expo-web-browser`. Verifique se a URL é válida.
  - Se `openExternalOnDifferentDomain` for `false`, a navegação será bloqueada.

- Botão voltar no Android fecha a tela em vez de voltar na WebView:
  - Confirme se o `onNavigationStateChange` está setando `canGoBack` corretamente.
  - Garanta que o listener do `BackHandler` está ativo.

- Conteúdo HTTP não carrega no Android:
  - Evite HTTP. Se inevitável, use `mixedContentMode="always"` no WebView no Android e avalie riscos.

- Mensagens `postMessage` não chegam ao app:
  - Verifique se o payload é `JSON.stringify` e se o `onMessage` faz `JSON.parse` corretamente.

- Tipagem do Navigator queixa da rota `WebView`:
  - Confirme se `RootStackParamList` inclui `WebView` e se o `AppStack.Screen` usa o mesmo nome.

## Dicas

- Valide domínios: mantenha uma lista restrita via `allowDomains` e exija `https` por padrão.
- Monitore erros de carregamento via `onError`/`onHttpError` (adicione conforme necessidade).
- Para performance, desabilite `setSupportMultipleWindows` e janelas pop-up.

