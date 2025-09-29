# Gerenciamento de Estado com Zustand

O Bytebank App utiliza [Zustand](https://github.com/pmndrs/zustand) para o gerenciamento de estado global da aplicação. Zustand foi escolhido por sua simplicidade, performance e por ter uma API mínima e sem boilerplate.

## Stores

O estado da aplicação é dividido em "stores" (lojas) separadas, cada uma com uma responsabilidade específica.

### `authStore`

-   **Localização**: `src/store/authStore.ts`
-   **Responsabilidade**: Gerenciar o estado de autenticação do usuário com persistência.
-   **Estado**:
    -   `user`: Armazena as informações do usuário logado (User | null | undefined)
    -   `loading`: Estado de carregamento das operações de auth
    -   `isHydrated`: Indica se o estado foi restaurado do AsyncStorage
-   **Ações**:
    -   `signIn(provider, options?)`: Login com diferentes provedores
    -   `signUp(options)`: Registro de novo usuário
    -   `signInAnonymously()`: Login anônimo
    -   `signOut()`: Logout e limpeza do estado
    -   `setPartialProfile(patch)`: Atualiza parcialmente o perfil
    -   `isAuthenticated()`: Função que retorna se está autenticado
-   **Recursos Especiais**:
    -   Persistência automática com AsyncStorage
    -   Migração de versões de dados
    -   Hook conveniente `useAuth()` para componentes

### `diStore`

-   **Localização**: `src/store/diStore.ts`
-   **Responsabilidade**: Gerenciar o contêiner de Injeção de Dependência (DI).
-   **Estado**:
    -   `container`: Armazena a instância do contêiner de DI.
-   **Ações**:
    -   `setContainer`: Define o contêiner de DI.

### `themeStore`

-   **Localização**: `src/store/themeStore.ts`
-   **Responsabilidade**: Gerenciar o tema da aplicação (Light/Dark mode) e a marca selecionada (whitelabel).
-   **Estado**:
    -   `theme`: O tema atual da aplicação.
    -   `brand`: A marca (brand) selecionada.
-   **Ações**:
    -   `setTheme`: Altera o tema da aplicação.
    -   `setBrand`: Altera a marca da aplicação.