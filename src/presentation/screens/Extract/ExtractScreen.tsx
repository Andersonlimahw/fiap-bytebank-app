import React, {
  useMemo,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  View,
  Text,
  FlatList,
  Alert,
  Modal,
  Pressable,
  Animated,
  TouchableOpacity,
  ListRenderItem,
} from "react-native";
import { Input } from "@components/Input";
import { TransactionItem } from "@components/TransactionItem";
import { useTheme } from "@presentation/theme/theme";
import { makeExtractStyles } from "./ExtractScreen.styles";
import { useExtractViewModel } from "@view-models/useExtractViewModel";
import type {
  Transaction,
  TransactionType,
} from "@domain/entities/Transaction";
import { Button } from "@components/Button";
import { Skeleton } from "@components/Skeleton";
import { Avatar } from "@components/Avatar";
import { useAuth } from "@store/authStore";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useI18n } from "@presentation/i18n/I18nProvider";
import { FileUploader } from "@app/presentation/components/FileUploader";

export const ExtractScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
    loading,
    transactions,
    search,
    setSearch,
    refresh,
    remove,
    update,
    supportsRealtime,
  } = useExtractViewModel();
  const { user } = useAuth();
  const { t } = useI18n();
  const theme = useTheme();
  const styles = useMemo(() => makeExtractStyles(theme), [theme]);
  // navigation object from hook is stable; avoid recreating callbacks per render
  const goUser = useCallback(
    () => (navigation as any)?.navigate?.("User"),
    [navigation]
  );
  const goAddTransaction = useCallback(
    () => (navigation as any)?.navigate?.("AddTransaction"),
    [navigation]
  );

  const [editing, setEditing] = useState<Transaction | null>(null);
  const [desc, setDesc] = useState("");
  const [amountText, setAmountText] = useState("");
  const [type, setType] = useState<TransactionType>("debit");
  const [category, setCategory] = useState("");
  const closeEdit = useCallback(() => setEditing(null), []);
  const [pickedFiles, setPickedFiles] = useState<any[]>([]);
  const [transactionId, setTransactionId] = useState<string | undefined>(
    undefined
  );

  const startEdit = useCallback((transaction: Transaction) => {
    setTransactionId(transaction.id);
    setEditing(transaction);
    setDesc(transaction.description);
    setAmountText((transaction.amount / 100).toFixed(2).replace(".", ","));
    setType(transaction.type);
    setCategory(transaction.category ?? "");
  }, []);

  const confirmDelete = useCallback(
    (transaction: Transaction) => {
      Alert.alert(
        t("extract.deleteConfirmTitle"),
        t("extract.deleteConfirmMessage"),
        [
          { text: t("extract.cancel"), style: "cancel" as const },
          {
            text: t("extract.delete"),
            style: "destructive" as const,
            onPress: async () => {
              await remove(transaction.id);
            },
          },
        ]
      );
    },
    [remove]
  );

  const openOptions = useCallback(
    (tx: Transaction) => {
      Alert.alert(
        t("extract.optionsTitle"),
        tx.description,
        [
          { text: t("extract.edit"), onPress: () => startEdit(tx) },
          {
            text: t("extract.delete"),
            style: "destructive" as const,
            onPress: () => confirmDelete(tx),
          },
          { text: t("extract.cancel"), style: "cancel" as const },
        ],
        { cancelable: true }
      );
    },
    [confirmDelete, startEdit]
  );

  const saveEdit = useCallback(async () => {
    if (!editing) return;
    const normalized = amountText.replace(/\./g, "").replace(",", ".");
    const num = Number(normalized);
    if (isNaN(num)) {
      Alert.alert(
        t("extract.invalidValueTitle"),
        t("extract.invalidValueMessage")
      );
      return;
    }
    const cents = Math.round(num * 100);
    const payload = {
      description: desc.trim(),
      amount: cents,
      type,
      category: category.trim() || undefined,
    };
    await update(editing.id, payload);
    closeEdit();
  }, [editing, amountText, desc, type, category, update, closeEdit]);

  const fabScale = React.useRef(new Animated.Value(1)).current;
  const fabIn = useCallback(() => {
    Animated.spring(fabScale, {
      toValue: 0.94,
      useNativeDriver: true,
      speed: 24,
      bounciness: 0,
    }).start();
  }, [fabScale]);
  const fabOut = useCallback(() => {
    Animated.spring(fabScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 16,
      bounciness: 6,
    }).start();
  }, [fabScale]);
  const scrollY = useRef(new Animated.Value(0)).current;
  const clamped = useMemo(() => Animated.diffClamp(scrollY, 0, 80), [scrollY]);
  const fabTranslateY = useMemo(
    () => clamped.interpolate({ inputRange: [0, 80], outputRange: [0, 100] }),
    [clamped]
  );
  const onScroll = useMemo(
    () =>
      Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: true,
      }),
    [scrollY]
  );
  const keyExtractor = useCallback((item: Transaction) => item.id, []);

  const fullSwipeDelete = useCallback(
    (tx: Transaction) => remove(tx.id),
    [remove]
  );
  const renderItem = useCallback<ListRenderItem<Transaction>>(
    ({ item }) => (
      <TransactionItem
        tx={item}
        onPressTx={openOptions}
        onEditTx={startEdit}
        onDeleteTx={confirmDelete}
        onFullSwipeDeleteTx={fullSwipeDelete}
      />
    ),
    [openOptions, startEdit, confirmDelete, fullSwipeDelete]
  );

  // When navigation focuses this screen and there is no realtime subscription,
  // trigger a refresh (avoid dependency on refresh identity to prevent loops).
  const refreshRef = useRef(refresh);
  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);
  // Keep a stable onRefresh handler for FlatList to avoid rebind churn
  const onRefreshList = useCallback(() => refreshRef.current?.(), []);
  useFocusEffect(
    useCallback(() => {
      if (!supportsRealtime) {
        refreshRef.current?.();
      }
      return undefined;
    }, [supportsRealtime])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.hello}>{t("extract.hello")}</Text>
          <Text style={styles.username}>
            {user?.name || t("extract.userFallback")}
          </Text>
        </View>
        <Avatar
          username={user?.name}
          source={user?.photoUrl ? { uri: user.photoUrl } : undefined}
          size={40}
          onPress={goUser}
        />
      </View>
      <Input
        placeholder={t("extract.searchPlaceholder")}
        value={search}
        onChangeText={setSearch}
        accessibilityLabel={t("extract.searchAccessibility")}
      />
      {loading ? (
        <View style={styles.loadingContainer}>
          <Skeleton height={44} style={styles.loadingSkeletonTop} />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height={52} style={styles.loadingSkeletonItem} />
          ))}
        </View>
      ) : transactions?.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t("extract.empty")}</Text>
          <Button
            title={t("extract.addTransaction")}
            onPress={goAddTransaction}
          />
        </View>
      ) : (
        <Animated.FlatList
          data={transactions}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          initialNumToRender={12}
          maxToRenderPerBatch={12}
          windowSize={10}
          removeClippedSubviews
          refreshing={loading}
          onRefresh={onRefreshList}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
        />
      )}

      <Animated.View
        style={[
          styles.fab,
          { transform: [{ scale: fabScale }, { translateY: fabTranslateY }] },
        ]}
      >
        <Pressable
          onPressIn={fabIn}
          onPressOut={fabOut}
          onPress={goAddTransaction}
          accessibilityRole="button"
          accessibilityLabel={t("extract.addTransactionAccessibility")}
          style={styles.fabPressable}
        >
          <Text style={styles.fabText}>+</Text>
        </Pressable>
      </Animated.View>

      <Modal
        visible={!!editing}
        transparent
        animationType="fade"
        onRequestClose={closeEdit}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {t("extract.editTransaction")}
            </Text>
            <Input
              label={t("extract.description")}
              value={desc}
              onChangeText={setDesc}
              placeholder={t("extract.description")}
            />
            <Input
              label={t("extract.categoryOptional")}
              value={category}
              onChangeText={setCategory}
              placeholder={t("extract.categoryOptional")}
            />
            <Input
              label={t("extract.valueBRL")}
              value={amountText}
              onChangeText={setAmountText}
              placeholder="0,00"
              keyboardType="decimal-pad"
            />
            <View style={styles.typeRow}>
              <TouchableOpacity
                onPress={() => setType("credit")}
                style={[
                  styles.typeBtn,
                  type === "credit" ? styles.typeBtnActive : undefined,
                ]}
                accessibilityRole="button"
                accessibilityLabel={t("extract.credit")}
              >
                <Text
                  style={[
                    styles.typeText,
                    type === "credit" ? styles.typeTextActive : undefined,
                  ]}
                >
                  {t("extract.credit")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setType("debit")}
                style={[
                  styles.typeBtn,
                  { marginLeft: theme.spacing.sm },
                  type === "debit" ? styles.typeBtnActive : undefined,
                ]}
                accessibilityRole="button"
                accessibilityLabel={t("extract.debit")}
              >
                <Text
                  style={[
                    styles.typeText,
                    type === "debit" ? styles.typeTextActive : undefined,
                  ]}
                >
                  {t("extract.debit")}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.typeRow}>
              <FileUploader mode={"bound"} transactionId={transactionId} />
            </View>

            <View style={styles.modalActions}>
              <Button
                title={t("extract.cancel")}
                onPress={closeEdit}
                style={styles.modalCancelBtn}
                textStyle={{ color: theme.colors.text }}
              />
              <Button
                title={t("extract.save")}
                onPress={saveEdit}
                style={styles.modalSaveBtn}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

/** styles moved to ExtractScreen.styles.ts */
