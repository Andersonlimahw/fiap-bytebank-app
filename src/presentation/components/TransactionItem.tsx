import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { View, Text, Pressable, Animated } from "react-native";
import type { Transaction } from "@domain/entities/Transaction";
import { formatCurrency, formatDateShort } from "../../utils/format";
import { useTheme } from "../theme/theme";
import { makeTransactionItemStyles } from "./TransactionItem.styles";
import { useI18n } from "../i18n/I18nProvider";
import { SwipeableRow } from "./SwipeableRow";

type Props = {
  tx: Transaction;
  // Tx-aware callbacks avoid creating per-item closures upstream
  onPressTx?: (tx: Transaction) => void;
  onEditTx?: (tx: Transaction) => void;
  onDeleteTx?: (tx: Transaction) => void;
  onFullSwipeDeleteTx?: (tx: Transaction) => void;
};

const TransactionItemBase: React.FC<Props> = ({
  tx,
  onPressTx,
  onEditTx,
  onDeleteTx,
  onFullSwipeDeleteTx,
}) => {
  const theme = useTheme();
  const { t } = useI18n();
  const styles = useMemo(() => makeTransactionItemStyles(theme), [theme]);
  const sign = tx.type === "credit" ? "+" : "-";
  const color =
    tx.type === "credit" ? theme.colors.success : theme.colors.danger;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(6)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  // Bind tx-aware callbacks lazily and stably
  const handlePress = useCallback(() => {
    return onPressTx?.(tx);
  }, [onPressTx, tx]);
  const handleEdit = useCallback(() => {
    return onEditTx?.(tx);
  }, [onEditTx, tx]);
  const handleDelete = useCallback(() => {
    return onDeleteTx?.(tx);
  }, [onDeleteTx, tx]);
  const handleFullSwipeDelete = useCallback(() => {
    return onFullSwipeDeleteTx?.(tx);
  }, [onFullSwipeDeleteTx, tx]);

  const content = (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      accessibilityRole={onPressTx ? "button" : undefined}
      accessibilityLabel={
        onPressTx
          ? `${t("extract.optionsTitle")}: ${tx.description}`
          : undefined
      }
    >
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {tx.description}
        </Text>
        <Text style={styles.date}>
          {formatDateShort(new Date(tx.createdAt))}
        </Text>
        {!!tx.category && <Text style={styles.category}>{tx.category}</Text>}
      </View>
      <View style={styles.amountWrap}>
        <Text style={[styles.amount, { color }]} numberOfLines={1}>
          {sign} {formatCurrency(tx.amount)}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {onEditTx || onDeleteTx || onFullSwipeDeleteTx ? (
        <SwipeableRow
          onEdit={handleEdit}
          onDelete={handleDelete}
          onFullSwipeDelete={handleFullSwipeDelete}
        >
          {content}
        </SwipeableRow>
      ) : (
        content
      )}
    </Animated.View>
  );
};

export const TransactionItem = React.memo(TransactionItemBase, (a, b) => {
  const atx = a.tx;
  const btx = b.tx;
  return (
    atx.id === btx.id &&
    atx.amount === btx.amount &&
    atx.description === btx.description &&
    atx.type === btx.type &&
    atx.category === btx.category &&
    atx.createdAt === btx.createdAt &&
    a.onPressTx === b.onPressTx &&
    a.onEditTx === b.onEditTx &&
    a.onDeleteTx === b.onDeleteTx &&
    a.onFullSwipeDeleteTx === b.onFullSwipeDeleteTx
  );
});

/** styles moved to TransactionItem.styles.ts */
