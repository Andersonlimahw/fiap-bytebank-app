# WebView Wrapper — Overview

Este overview explica rapidamente o que será adicionado ao app e como se integra à arquitetura existente.

## O que será adicionado

- Nova rota `WebView` no `AppStack` (React Navigation).
- Tela `WebViewScreen` que:
  - Monta a URL final a partir de `url` ou `baseUrl + queryParams`.
  - Valida domínios permitidos (`allowDomains`).
  - Abre domínios externos no navegador do sistema (padrão seguro).
  - Suporta headers HTTP e comunicação `postMessage`.
  - Integra tema e i18n do projeto.
  - Trata botão “voltar” do Android dentro da própria WebView quando possível.

## Como encaixa no codebase atual

```mermaid
graph LR
  A[App.tsx] --> B[NavigationContainer]
  B --> C[RootNavigator]
  C --> D[AppStack]
  D --> E[Tabs]
  D --> F[User]
  D --> G[Pix]
  D --> H[DigitalCards]
  D --> I[AddTransaction]
  D --> J[WebView (nova)]
```

## Segurança por padrão

- Apenas `https` permitido se não houver `allowDomains`.
- Whitelist de domínios via `allowDomains`.
- Conteúdo em `http` é desencorajado (use ATS e `https`).

