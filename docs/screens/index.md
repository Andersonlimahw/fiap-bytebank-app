# Screens (Telas)

Este documento descreve como as screens estão implementadas no aplicativo ByteBank, incluindo arquitetura, padrões de navegação e exemplos detalhados.

## Arquitetura de Screens

### Estrutura de Arquivos

As screens estão organizadas em `src/presentation/screens/` seguindo uma estrutura por funcionalidade:

```
src/presentation/screens/
├── Auth/
│   ├── LoginScreen.tsx
│   └── RegisterScreen.tsx
├── Home/
│   ├── HomeScreen.tsx
│   └── HomeScreen.styles.ts
├── Dashboard/
│   ├── DashboardScreen.tsx
│   └── DashboardScreen.styles.ts
├── Cards/
│   └── DigitalCardsScreen.tsx
├── Transactions/
│   └── AddTransactionScreen.tsx
├── User/
│   └── UserScreen.tsx
├── Pix/
│   └── PixScreen.tsx
├── Extract/
│   └── ExtractScreen.tsx
├── Investments/
└── Onboarding/
    └── OnboardingScreen.tsx
```

### Padrões de Implementação

#### 1. Screen Básica com ViewModel

**Exemplo: HomeScreen.tsx**

```typescript
import React, { useMemo } from "react";
import { useHomeViewModel } from "@view-models/useHomeViewModel";
import { useAuth } from "@store/authStore";
import { useTheme } from "@presentation/theme/theme";
import { useFadeSlideInOnFocus } from "../../hooks/animations";

export const HomeScreen: React.FC<any> = ({ navigation }) => {
  const { loading, transactions, balance, refresh } = useHomeViewModel();
  const { user, signOut } = useAuth();
  const { animatedStyle } = useFadeSlideInOnFocus();
  const { t } = useI18n();
  const theme = useTheme();
  const styles = useMemo(() => makeHomeStyles(theme), [theme]);

  return (
    <Animated.ScrollView style={styles.container}>
      {/* Conteúdo da screen */}
    </Animated.ScrollView>
  );
};
```

**Características:**
- Uso de ViewModels para lógica de negócio
- Integração com store global (Auth)
- Animações de entrada com hooks customizados
- Tema e internacionalização

#### 2. Screen Complexa com Múltiplos ViewModels

**Exemplo: DashboardScreen.tsx**

```typescript
export const DashboardScreen: React.FC<any> = ({ navigation }) => {
  const { user, balance, transactions, loading, refresh } = useDashboardViewModel();
  const { cards } = useDigitalCardsViewModel();
  const { animatedStyle } = useFadeSlideInOnFocus();
  const { animatedStyle: chartStyle } = useChartEntranceAndPulse(
    transactions?.length ?? 0
  );

  const goAddTransaction = useCallback(
    () => navigation?.navigate?.("AddTransaction"),
    [navigation]
  );

  return (
    <Animated.ScrollView>
      {/* Header com informações do usuário */}
      {/* Card de saldo */}
      {/* Ações rápidas */}
      {/* Seção de cartões */}
      {/* Gráfico de gastos */}
      {/* Transações recentes */}
    </Animated.ScrollView>
  );
};
```

**Características:**
- Múltiplos ViewModels para diferentes funcionalidades
- Navegação programática com callbacks
- Componentes complexos (charts, cards)
- Animações específicas para diferentes seções

## Screens Principais

### 1. HomeScreen
- **Localização**: `src/presentation/screens/Home/HomeScreen.tsx`
- **Propósito**: Tela principal após login
- **Funcionalidades**:
  - Exibição de saldo
  - Ações rápidas (PIX, cartões, empréstimos, etc.)
  - Transações recentes
  - Acesso ao perfil do usuário

**Exemplo de Uso:**
```typescript
<QuickAction
  label={t("home.pix")}
  icon={require("../../../../public/assets/images/icons/Ícone Pix.png")}
  onPress={() => navigation?.navigate?.("Pix")}
/>
```

### 2. DashboardScreen
- **Localização**: `src/presentation/screens/Dashboard/DashboardScreen.tsx`
- **Propósito**: Visão analítica das finanças
- **Funcionalidades**:
  - Gráfico de gastos por categoria
  - Visualização de cartões
  - Botões de demo (crédito/débito)
  - Análise de transações

**Exemplo de Integração com Charts:**
```typescript
<HorizontalBarChart
  data={buildSpendingChartData(transactions || [], t)}
  formatValue={(v) => formatCurrency(v)}
  testID="dashboard-spending-chart"
/>
```

### 3. DigitalCardsScreen
- **Localização**: `src/presentation/screens/Cards/DigitalCardsScreen.tsx`
- **Propósito**: Gerenciamento de cartões digitais
- **Funcionalidades**:
  - Visualização de cartões com animação flip
  - Adição/remoção de cartões
  - Detalhes completos dos cartões

### 4. Auth Screens
- **Localização**: `src/presentation/screens/Auth/`
- **Propósito**: Autenticação e registro
- **Screens**:
  - `LoginScreen.tsx`: Login com email/senha
  - `RegisterScreen.tsx`: Cadastro de novos usuários

## Padrões de Design

### ViewModel Integration

```typescript
const { loading, data, error, refresh } = useScreenViewModel();

// Estado de loading
if (loading) return <LoadingComponent />;

// Estado de erro
if (error) return <ErrorComponent error={error} />;

// Renderização normal
return <ScreenContent data={data} onRefresh={refresh} />;
```

### Navegação

```typescript
// Navegação simples
navigation?.navigate?.("ScreenName");

// Navegação com parâmetros
navigation?.navigate?.("ScreenName", { param: value });

// Navegação programática
const goToScreen = useCallback(
  () => navigation?.navigate?.("ScreenName"),
  [navigation]
);
```

### Layout Responsivo

```typescript
<ScrollView
  contentContainerStyle={{
    paddingBottom: theme.spacing.xl
  }}
  showsVerticalScrollIndicator={false}
>
  <View style={styles.section}>
    {/* Conteúdo adaptável */}
  </View>
</ScrollView>
```

### Animações de Entrada

```typescript
const { animatedStyle } = useFadeSlideInOnFocus();

return (
  <Animated.ScrollView>
    <Animated.View style={animatedStyle}>
      {/* Conteúdo animado */}
    </Animated.View>
  </Animated.ScrollView>
);
```

## Funcionalidades por Screen

### Home vs Dashboard

**HomeScreen**:
- Foco em ações rápidas
- Interface mais simples
- Transações básicas

**DashboardScreen**:
- Análise detalhada
- Gráficos e métricas
- Visão gerencial

### Estados de Carregamento

```typescript
<FlatList
  data={transactions}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <TransactionItem tx={item} />}
  refreshing={loading}
  onRefresh={refresh}
  scrollEnabled={false}
/>
```

### Helpers e Utilities

#### Análise de Gastos
```typescript
function buildSpendingChartData(transactions: any[], t: TFunc): ChartDatum[] {
  const debits = transactions.filter((tx) => tx?.type === "debit");
  const groups = new Map<string, number>();

  for (const tx of debits) {
    const category = deriveCategoryFromDescription(tx?.description);
    const current = groups.get(category) || 0;
    groups.set(category, current + Number(tx?.amount));
  }

  return Array.from(groups.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, value]) => ({ label: t(`categories.${label}`), value }));
}
```

#### Categorização Automática
```typescript
function deriveCategoryFromDescription(desc: string): string {
  const d = desc.toLowerCase();
  if (d.includes("grocery") || d.includes("market")) return "groceries";
  if (d.includes("coffee") || d.includes("restaurant")) return "foodDrink";
  if (d.includes("uber") || d.includes("gas")) return "transport";
  return "other";
}
```

## Performance e Otimização

### ScrollView vs FlatList
- **ScrollView**: Para conteúdo limitado e misto
- **FlatList**: Para listas longas com dados uniformes

### Memoization
```typescript
const styles = useMemo(() => makeScreenStyles(theme), [theme]);
const processedData = useMemo(() => processData(rawData), [rawData]);
```

### Lazy Loading
```typescript
const LazyComponent = React.lazy(() => import('./HeavyComponent'));

<Suspense fallback={<LoadingSpinner />}>
  <LazyComponent />
</Suspense>
```

## Testes

### Estrutura de Testes
```typescript
describe('HomeScreen', () => {
  beforeEach(() => {
    mockUseHomeViewModel.mockReturnValue({
      loading: false,
      transactions: mockTransactions,
      balance: 1000
    });
  });

  it('should render user greeting', () => {
    render(<HomeScreen navigation={mockNavigation} />);
    expect(screen.getByText(/hello/i)).toBeInTheDocument();
  });
});
```

## Próximos Passos

- [ ] Implementar navegação tipo-safe com React Navigation
- [ ] Adicionar mais animações de transição
- [ ] Melhorar tratamento de estados de erro
- [ ] Implementar deep linking
- [ ] Adicionar skeleton loading states