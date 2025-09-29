import React, { useMemo, useCallback } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Animated,
} from "react-native";
import { formatCurrency } from "@utils/format";
import { QuickAction } from "@components/QuickAction";
import { TransactionItem } from "@components/TransactionItem";
import { useDashboardViewModel } from "@presentation/viewmodels/useDashboardViewModel";
import { useTheme } from "@presentation/theme/theme";
import { useI18n } from "@presentation/i18n/I18nProvider";
import { makeDashboardStyles } from "./DashboardScreen.styles";
import {
  useFadeSlideInOnFocus,
  useChartEntranceAndPulse,
} from "@presentation/hooks/animations";
import { Avatar } from "@components/Avatar";
import { useDigitalCardsViewModel } from "@presentation/viewmodels/useDigitalCardsViewModel";
import { CardVisual } from "@components/DigitalCard";
import HorizontalBarChart, {
  type ChartDatum,
} from "@components/charts/HorizontalBarChart";
import { EmptyStateBanner } from "@components/EmptyStateBanner";

export const DashboardScreen: React.FC<any> = ({ navigation }) => {
  const { user, balance, transactions, loading, refresh } =
    useDashboardViewModel();
  const { animatedStyle } = useFadeSlideInOnFocus();
  const { animatedStyle: chartStyle } = useChartEntranceAndPulse(
    transactions?.length ?? 0
  );
  const theme = useTheme();
  const { t } = useI18n();
  const styles = useMemo(() => makeDashboardStyles(theme), [theme]);
  const { cards } = useDigitalCardsViewModel();

  const goAddTransaction = useCallback(
    () => (navigation as any)?.navigate?.("AddTransaction"),
    [navigation]
  );

  return (
    <Animated.ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: theme.spacing.xl }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={animatedStyle as any}>
        <View style={styles.header}>
          <View>
            <Text style={styles.hello}>{t("home.hello")}</Text>
            <Text style={styles.username}>
              {user?.name || t("home.userFallback")}
            </Text>
          </View>
          <Avatar
            username={user?.name}
            source={user?.photoUrl ? { uri: user.photoUrl } : undefined}
            size={40}
            onPress={() => (navigation as any)?.navigate?.("User")}
          />
        </View>

        <Image
          source={require("../../../../public/assets/images/banners/home.png")}
          style={styles.banner}
        />

        <View style={styles.card}>
          <Text style={styles.cardLabel}>{t("dashboard.totalBalance")}</Text>
          <Text style={styles.cardValue}>{formatCurrency(balance)}</Text>
          <View style={styles.row}>
            <TouchableOpacity
              onPress={goAddTransaction}
              style={[
                styles.smallBtn,
                { backgroundColor: theme.colors.success },
              ]}
              accessibilityRole="button"
              accessibilityLabel={t("dashboard.demoCredit")}
            >
              <Text style={styles.smallBtnText}>
                {t("dashboard.demoCredit")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={goAddTransaction}
              style={[
                styles.smallBtn,
                {
                  backgroundColor: theme.colors.danger,
                  marginLeft: theme.spacing.sm,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={t("dashboard.demoDebit")}
            >
              <Text style={styles.smallBtnText}>
                {t("dashboard.demoDebit")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t("dashboard.shortcuts")}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.actionsRow}
        >
          <QuickAction
            label={t("home.cards")}
            icon={require("../../../../public/assets/images/icons/Ícone cartões.png")}
            onPress={() => (navigation as any)?.navigate?.("DigitalCards")}
          />
          <QuickAction
            label={t("home.pix")}
            icon={require("../../../../public/assets/images/icons/Ícone Pix.png")}
            style={styles.actionGap}
          />

          <QuickAction
            label={t("home.loan")}
            icon={require("../../../../public/assets/images/icons/Ícone empréstimo.png")}
            style={styles.actionGap}
          />
          <QuickAction
            label={t("home.withdraw")}
            icon={require("../../../../public/assets/images/icons/Ícone Saque.png")}
            style={styles.actionGap}
          />
          <QuickAction
            label={t("home.insurance")}
            icon={require("../../../../public/assets/images/icons/Ícone seguros.png")}
            style={styles.actionGap}
          />
          <QuickAction
            label={t("home.donations")}
            icon={require("../../../../public/assets/images/icons/Ícone doações.png")}
            style={styles.actionGap}
          />
        </ScrollView>

        <Text style={styles.sectionTitle}>{t("dashboard.myCards")}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 4 }}
        >
          {cards && cards.length > 0 ? (
            cards.map((c, idx) => (
              <TouchableOpacity
                key={c.id}
                onPress={() => (navigation as any)?.navigate?.("DigitalCards")}
                accessibilityRole="button"
                accessibilityLabel={t("titles.digitalCards")}
              >
                <CardVisual
                  card={c}
                  style={{ marginRight: idx < cards.length - 1 ? 12 : 0 }}
                />
              </TouchableOpacity>
            ))
          ) : (
            <EmptyStateBanner title={"Nenhum cartão adicionado"} />
          )}
        </ScrollView>

        <Text style={styles.sectionTitle}>
          {t("dashboard.spendingSummary")}
        </Text>
        <View style={{ marginBottom: theme.spacing.sm }}>
          <HorizontalBarChart
            data={buildSpendingChartData(transactions || [], t)}
            formatValue={(v) => formatCurrency(v)}
            testID="dashboard-spending-chart"
          />
        </View>

        <Text style={styles.sectionTitle}>
          {t("dashboard.recentTransactions")}
        </Text>
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TransactionItem tx={item} />}
          refreshing={loading}
          onRefresh={refresh}
          scrollEnabled={false}
        />
      </Animated.View>
    </Animated.ScrollView>
  );
};

/** styles moved to DashboardScreen.styles.ts */

// Helpers
type TFunc = (k: string) => string;
function buildSpendingChartData(transactions: any[], t: TFunc): ChartDatum[] {
  // Consider only debits for spending
  const debits = (transactions || []).filter((tx) => tx?.type === "debit");
  if (debits.length === 0) return [];

  const groups = new Map<string, number>();
  for (const tx of debits) {
    const rawCat: string | undefined = tx?.category;
    const key = normalizeCategoryKey(
      rawCat || deriveCategoryFromDescription(String(tx?.description || ""))
    );
    const prev = groups.get(key) || 0;
    groups.set(key, prev + (Number(tx?.amount) || 0));
  }
  // Sort by value desc and pick top 6
  const entries = Array.from(groups.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  return entries.map(([key, value]) => ({
    label: t(`charts.categories.${key}`),
    value,
  }));
}

function normalizeCategoryKey(k: string): string {
  const known = [
    "groceries",
    "foodDrink",
    "shopping",
    "transport",
    "bills",
    "income",
    "other",
  ] as const;
  const lc = (k || "").toLowerCase();
  const match = known.find((x) => x === lc);
  return match || "other";
}

function deriveCategoryFromDescription(desc: string): string {
  const d = desc.toLowerCase();
  if (
    d.includes("grocery") ||
    d.includes("grocer") ||
    d.includes("market") ||
    d.includes("super")
  )
    return "groceries";
  if (
    d.includes("coffee") ||
    d.includes("cafe") ||
    d.includes("restaurant") ||
    d.includes("food") ||
    d.includes("pizza")
  )
    return "foodDrink";
  if (
    d.includes("uber") ||
    d.includes("lyft") ||
    d.includes("bus") ||
    d.includes("metro") ||
    d.includes("gas")
  )
    return "transport";
  if (
    d.includes("netflix") ||
    d.includes("energy") ||
    d.includes("water") ||
    d.includes("phone") ||
    d.includes("bill")
  )
    return "bills";
  if (d.includes("shop") || d.includes("store") || d.includes("mall"))
    return "shopping";
  return "other";
}
