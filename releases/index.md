# Release v1.0.0

**Data de Lançamento:** 20231027

## Changelog

Esta é a primeira versão do nosso aplicativo!

### ✨ Novas Funcionalidades

**Funcionalidade A:** Descrição da nova funcionalidade A.

- **Funcionalidade B:** Descrição da nova funcionalidade B.

### 🐛 Correções de Bugs

Corrigido um problema onde o aplicativo fechava inesperadamente na tela de login.

- Melhorada a performance na listagem de itens.

### assets

`releases/android/apk/release/app-release.apk`

- `App.ipa` (ou instruções para TestFlight)

## Instalação do Aplicativo Android (.apk)

### 1. Dispositivo Físico

Para instalar o APK em um celular ou tablet Android:

1. **Baixe o arquivo** `apprelease.apk` no seu dispositivo.
   Antes de instalar, você precisa permitir a instalação de aplicativos de fontes desconhecidas. Vá para **Configurações > Segurança** (ou **Configurações > Apps e notificações > Avançado > Acesso especial a apps > Instalar apps desconhecidos**).

1. Encontre o arquivo APK baixado no seu gerenciador de arquivos e toque nele para iniciar a instalação.
   Siga as instruções na tela.

### 2. Emulador (Android Studio)

A maneira mais fácil de instalar em um emulador que já está em execução é:

1. **Baixe o arquivo** `releases/android/apk/release/app-release.apk` no seu computador.
   **Arraste e solte** o arquivo `.apk` diretamente na janela do emulador. A instalação começará automaticamente.

### 3. Linha de Comando (ADB)

Para usuários avançados, é possível instalar via Android Debug Bridge (ADB).

1. Certifiquese de que o Android SDK PlatformTools (que inclui o ADB) está instalado.
   - Inicie seu emulador ou conecte um dispositivo físico com a depuração USB ativada.
   - Abra seu terminal ou prompt de comando.
   - Navegue até a pasta onde você baixou o APK e execute o comando:

```sh
adb install releases/android-versions/apk/release/app-release.apk
```

## Instalação do Aplicativo iOS

### Devido a restrições apple só é possível executar o app no IOS via simulador.

Então siga os comandos abaixo
Executar pre-build

```sh
npx expo prebuild --clean

```

Executar num emulador IOS:

```sh
npm run ios

```

ou

```sh
EXPO_PUBLIC_USE_MOCK=false npx expo run:ios

```

### 1. Dispositivo Físico (via TestFlight)

A distribuição de aplicativos iOS para teste é feita de forma segura através do TestFlight da Apple.

1. Instale o aplicativo TestFlight da App Store.
   Você receberá um convite por email ou um link público para testar o aplicativo.
   Abra o convite e toque em "View in TestFlight" ou "Start testing".
   Você será redirecionado para o TestFlight, onde poderá instalar a versão mais recente do aplicativo.

### 2. Simulador (Xcode)

Para instalar em um simulador do iOS:

1. **Compile o projeto** no Xcode e selecione um simulador como alvo. O Xcode instalará e executará o aplicativo automaticamente.
   **Alternativamente (com o arquivo `.app`):**

Compile o aplicativo para o simulador (o arquivo `.app` estará na pasta de `DerivedData`).
Inicie o simulador desejado.
**Arraste e solte** o arquivo `.app` na janela do simulador.

### 3. Linha de Comando (`simctl`)

Você pode usar as ferramentas de linha de comando do Xcode para instalar o app em um simulador em execução.

1. Compile o projeto para o simulador para obter o arquivo `.app`.
   Inicie o simulador que você deseja usar.
   Abra o terminal e execute o comando abaixo, substituindo `caminho/para/seu/app.app` pelo caminho correto. `booted` referese ao simulador atualmente em execução.
