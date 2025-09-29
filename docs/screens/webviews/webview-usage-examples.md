# WebView Wrapper — Exemplos de uso

## 1) Navegar para uma URL simples

```ts
navigation.navigate('WebView', {
  url: 'https://app.exemplo.com/portal',
  title: 'Portal do Cliente',
});
```

## 2) Montar URL com queryParams

```ts
navigation.navigate('WebView', {
  baseUrl: 'https://app.exemplo.com/portal',
  title: 'Portal do Cliente',
  queryParams: {
    userId: '123',
    lang: 'pt',
    theme: theme.mode, // claro/escuro do app
  },
});
```

Resultado final: `https://app.exemplo.com/portal?userId=123&lang=pt&theme=dark`

## 3) Restringir domínios permitidos

```ts
navigation.navigate('WebView', {
  url: 'https://sub.meudominio.com/pagina',
  allowDomains: ['meudominio.com'], // subdomínios inclusos via endsWith
});
```

Navegação para domínios fora da whitelist abrirá no navegador externo (padrão).

## 4) Bloquear abertura externa e manter apenas domínios permitidos

```ts
navigation.navigate('WebView', {
  url: 'https://sub.meudominio.com/pagina',
  allowDomains: ['meudominio.com'],
  openExternalOnDifferentDomain: false, // bloqueia 100% dentro do app
});
```

## 5) Enviar headers HTTP (autenticação, etc.)

```ts
navigation.navigate('WebView', {
  url: 'https://app.exemplo.com/area',
  headers: {
    Authorization: `Bearer ${token}`,
    'X-Client': 'bytebank-app',
  },
});
```

## 6) Comunicação Web → App (fechar a WebView)

Na página web:

```js
window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'CLOSE_WEBVIEW' }));
```

No app, o `onMessage` já trata esse tipo e executa `navigation.goBack()`.

## 7) Botões úteis no header

- Refresh (recarrega a página)
- Abrir no navegador (desabilite com `hideShare: true` se não quiser expor)

