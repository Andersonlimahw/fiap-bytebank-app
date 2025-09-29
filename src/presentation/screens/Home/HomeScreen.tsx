import React, { useMemo } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  ScrollView,
  Animated,
} from "react-native";
import { useHomeViewModel } from "@view-models/useHomeViewModel";
import { TransactionItem } from "@components/TransactionItem";
import { useAuth } from "@store/authStore";
import { formatCurrency } from "../../../utils/format";
import { QuickAction } from "@components/QuickAction";
import { useTheme } from "@presentation/theme/theme";
import { makeHomeStyles } from "./HomeScreen.styles";
import { useFadeSlideInOnFocus } from "../../hooks/animations";
import { Avatar } from "@components/Avatar";
import { useI18n } from "@presentation/i18n/I18nProvider";

export const HomeScreen: React.FC<any> = ({ navigation }) => {
  const { loading, transactions, balance, refresh } = useHomeViewModel();
  const { user, signOut } = useAuth();
  const { animatedStyle } = useFadeSlideInOnFocus();
  const { t } = useI18n();
  const theme = useTheme();
  const styles = useMemo(() => makeHomeStyles(theme), [theme]);

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
          <Text style={styles.cardLabel}>{t("home.balance")}</Text>
          <Text style={styles.cardValue}>{formatCurrency(balance)}</Text>
          <Text onPress={signOut} style={styles.signOut}>
            {t("home.signOut")}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>{t("home.shortcuts")}</Text>
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
            style={styles.actionGap}
            icon={require("../../../../public/assets/images/icons/Ícone Pix.png")}
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

        <Text style={styles.sectionTitle}>{t("home.recentTransactions")}</Text>
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

/** styles moved to HomeScreen.styles.ts */
