# WebView Wrapper — Configuração iOS/Android (Expo)

Este guia cobre ajustes de configuração para iOS e Android usando Expo, mantendo o app seguro e compatível.

## Dependência

- Já citado: `npx expo install react-native-webview`
- Se usar Dev Client/bare: `npx expo prebuild` e `cd ios && pod install` quando necessário.

## iOS — App Transport Security (ATS)

- Por padrão, permita apenas `https`. Caso precise liberar domínios específicos com exceções (ex.: HTTP ou TLS fraco), adicione no `app.json` em `ios.infoPlist`:

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSAppTransportSecurity": {
          "NSAllowsArbitraryLoads": false,
          "NSExceptionDomains": {
            "exemplo.com": {
              "NSTemporaryExceptionAllowsInsecureHTTPLoads": true,
              "NSIncludesSubdomains": true
            }
          }
        }
      }
    }
  }
}
```

- Recomenda-se manter `NSAllowsArbitraryLoads=false` e adicionar exceções por domínio.

## Android — Mixed Content e Intents (opcionais)

- Para carregar conteúdos `http` (não recomendado), ajuste a prop do `WebView` no Android:

```tsx
// Apenas se realmente precisar de HTTP
<WebView mixedContentMode="always" />
```

- Se quiser abrir links externos com app links/universal links, configure intent filters (opcional, fora do escopo mínimo). No Expo Managed, isso pode exigir config adicional no `app.json`/plugins.

## Linking (Deep Link/Universal Link) — Opcional

Seu `app.json` já define `"scheme": "bytebank"`. Para acessar a tela pela URL `bytebank://webview?...`, adicione um `linking` no `NavigationContainer` em `App.tsx`:

```tsx
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from './src/presentation/navigation/types';

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['bytebank://'],
  config: {
    screens: {
      WebView: 'webview',
      // demais rotas...
    },
  },
};

// ...
<NavigationContainer linking={linking} theme={getNavigationTheme(theme) as any}>
  {/* ... */}
</NavigationContainer>
```

Isso permite algo como:

```
bytebank://webview?url=https%3A%2F%2Fapp.exemplo.com%2Fportal&token=abc&lang=pt
```

Na `WebViewScreen`, os parâmetros chegam em `route.params` conforme mapeamento do React Navigation.

