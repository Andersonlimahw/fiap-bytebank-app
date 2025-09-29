import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  Share,
} from "react-native";
import { useTheme } from "@presentation/theme/theme";
import { makePixStyles } from "./PixScreen.styles";
import { usePixViewModel } from "@view-models/usePixViewModel";
import { formatCurrency } from "../../../utils/format";
import { useI18n } from "@presentation/i18n/I18nProvider";

type Section =
  | "send"
  | "payqr"
  | "receive"
  | "keys"
  | "favorites"
  | "history"
  | "limits";

export const PixScreen: React.FC<any> = () => {
  const theme = useTheme();
  const styles = useMemo(() => makePixStyles(theme), [theme]);
  const { t } = useI18n();
  const {
    loading,
    error,
    keys,
    favorites,
    transfers,
    limits,
    sendByKey,
    payQr,
    createQr,
    addKey,
    removeKey,
    addFav,
    removeFav,
    updateLimits,
    refresh,
  } = usePixViewModel();

  const [section, setSection] = useState<Section>("send");
  const [send, setSend] = useState({ key: "", amount: "", desc: "" });
  const [qrInput, setQrInput] = useState("");
  const [receive, setReceive] = useState({
    amount: "",
    desc: "",
    generated: "",
  });
  const [newFav, setNewFav] = useState({ alias: "", key: "", name: "" });
  const [newKey, setNewKey] = useState<{
    type: "email" | "phone" | "cpf" | "random";
    value?: string;
  }>({ type: "random" });
  const [limitsEdit, setLimitsEdit] = useState<{
    daily?: string;
    nightly?: string;
    per?: string;
  }>({});

  const loadingText = useMemo(
    () => (loading ? t("pix.loading") : ""),
    [loading, t]
  );

  const handleSend = async () => {
    const amountCents = Math.round(
      parseFloat((send.amount || "0").replace(",", ".")) * 100
    );
    if (!send.key || !amountCents)
      return Alert.alert(
        t("pix.alert.invalidDataTitle"),
        t("pix.alert.enterKeyAndAmount")
      );
    try {
      await sendByKey(send.key.trim(), amountCents, send.desc || undefined);
      setSend({ key: "", amount: "", desc: "" });
      Alert.alert(t("pix.alert.pixSentTitle"), t("pix.alert.pixSentMessage"));
    } catch (e: any) {
      Alert.alert(
        t("pix.alert.pixErrorTitle"),
        e?.message || t("pix.alert.pixErrorMessage")
      );
    }
  };

  const handlePayQr = async () => {
    if (!qrInput)
      return Alert.alert(
        t("pix.alert.enterQrTitle"),
        t("pix.alert.enterQrMessage")
      );
    try {
      await payQr(qrInput.trim());
      setQrInput("");
      Alert.alert(t("pix.alert.pixPaidTitle"), t("pix.alert.pixPaidMessage"));
    } catch (e: any) {
      Alert.alert(
        t("pix.alert.pixPayErrorTitle"),
        e?.message || t("pix.alert.pixPayErrorMessage")
      );
    }
  };

  const handleGenerateQr = async () => {
    const amountCents = receive.amount
      ? Math.round(parseFloat(receive.amount.replace(",", ".")) * 100)
      : undefined;
    const { qr } = await createQr(amountCents, receive.desc || undefined);
    setReceive((s) => ({ ...s, generated: qr }));
  };

  const applyLimits = async () => {
    const daily = limitsEdit.daily
      ? Math.round(parseFloat(limitsEdit.daily.replace(",", ".")) * 100)
      : undefined;
    const nightly = limitsEdit.nightly
      ? Math.round(parseFloat(limitsEdit.nightly.replace(",", ".")) * 100)
      : undefined;
    const per = limitsEdit.per
      ? Math.round(parseFloat(limitsEdit.per.replace(",", ".")) * 100)
      : undefined;
    try {
      await updateLimits({
        dailyLimitCents: daily,
        nightlyLimitCents: nightly,
        perTransferLimitCents: per,
      });
      setLimitsEdit({});
      Alert.alert(t("pix.alert.limitsUpdated"));
    } catch (e: any) {
      Alert.alert(
        t("pix.alert.errorTitle"),
        e?.message || t("pix.alert.limitsUpdateError")
      );
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>{t("pix.actionsTitle")}</Text>
      <TouchableOpacity
        onPress={refresh}
        style={{ alignSelf: "flex-start", marginBottom: 8 }}
      >
        <Text style={styles.meta}>{t("pix.refresh")}</Text>
      </TouchableOpacity>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.actionsRow}
      >
        {(
          [
            ["send", t("pix.tabs.send")],
            ["payqr", t("pix.tabs.payqr")],
            ["receive", t("pix.tabs.receive")],
            ["keys", t("pix.tabs.keys")],
            ["favorites", t("pix.tabs.favorites")],
            ["history", t("pix.tabs.history")],
            ["limits", t("pix.tabs.limits")],
          ] as [Section, string][]
        ).map(([id, label], idx) => (
          <TouchableOpacity
            key={id}
            style={[
              styles.action,
              idx > 0 && styles.actionGap,
              section === id && {
                borderWidth: 2,
                borderColor: theme.colors.primary,
              },
            ]}
            onPress={() => setSection(id)}
            accessibilityRole="button"
            accessibilityLabel={label}
          >
            <Text style={styles.actionLabel}>{label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {!!error && (
        <View
          style={[
            styles.card,
            {
              borderColor: theme.colors.danger,
              backgroundColor: theme.colors.surface,
            },
          ]}
        >
          <Text style={{ color: theme.colors.danger }}>{error}</Text>
        </View>
      )}

      {section === "send" && (
        <View style={styles.card}>
          <Text style={{ fontWeight: "600" }}>{t("pix.sendByKey")}</Text>
          <TextInput
            placeholder={t("pix.keyPlaceholder")}
            value={send.key}
            onChangeText={(t) => setSend((s) => ({ ...s, key: t }))}
            style={styles.input}
            autoCapitalize="none"
          />
          <TextInput
            placeholder={t("pix.amountPlaceholder")}
            value={send.amount}
            onChangeText={(t) => setSend((s) => ({ ...s, amount: t }))}
            style={styles.input}
            keyboardType="decimal-pad"
          />
          <TextInput
            placeholder={t("pix.descOptional")}
            value={send.desc}
            onChangeText={(t) => setSend((s) => ({ ...s, desc: t }))}
            style={styles.input}
          />
          <TouchableOpacity
            style={styles.btn}
            onPress={handleSend}
            accessibilityRole="button"
          >
            <Text style={styles.btnText}>{t("pix.sendPix")}</Text>
          </TouchableOpacity>
          {!!loadingText && <Text style={styles.meta}>{loadingText}</Text>}
        </View>
      )}

      {section === "payqr" && (
        <View style={styles.card}>
          <Text style={{ fontWeight: "600" }}>{t("pix.payQrTitle")}</Text>
          <Text style={styles.meta}>{t("pix.pasteQrContent")}</Text>
          <TextInput
            placeholder={t("pix.qrInputPlaceholder")}
            value={qrInput}
            onChangeText={setQrInput}
            style={[styles.input, { height: 100 }]}
            multiline
          />
          <TouchableOpacity
            style={styles.btn}
            onPress={handlePayQr}
            accessibilityRole="button"
          >
            <Text style={styles.btnText}>{t("pix.pay")}</Text>
          </TouchableOpacity>
          {!!loadingText && <Text style={styles.meta}>{loadingText}</Text>}
        </View>
      )}

      {section === "receive" && (
        <View style={styles.card}>
          <Text style={{ fontWeight: "600" }}>{t("pix.receiveByQr")}</Text>
          <TextInput
            placeholder={t("pix.valueOptional")}
            value={receive.amount}
            onChangeText={(t) => setReceive((s) => ({ ...s, amount: t }))}
            style={styles.input}
            keyboardType="decimal-pad"
          />
          <TextInput
            placeholder={t("pix.descOptional")}
            value={receive.desc}
            onChangeText={(t) => setReceive((s) => ({ ...s, desc: t }))}
            style={styles.input}
          />
          <TouchableOpacity
            style={styles.btn}
            onPress={handleGenerateQr}
            accessibilityRole="button"
          >
            <Text style={styles.btnText}>{t("pix.generateQr")}</Text>
          </TouchableOpacity>
          {!!receive.generated && (
            <View style={styles.qrBox}>
              <Text selectable>{t("pix.generatedPayload")}</Text>
              <Text selectable>{receive.generated}</Text>
              <TouchableOpacity
                style={[styles.btn, { marginTop: 12 }]}
                onPress={async () => {
                  try {
                    await Share.share({ message: receive.generated });
                  } catch {}
                }}
              >
                <Text style={styles.btnText}>{t("pix.share")}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {section === "keys" && (
        <View style={styles.card}>
          <Text style={{ fontWeight: "600", marginBottom: 8 }}>
            {t("pix.keysTitle")}
          </Text>
          <View>
            {(keys || []).map((k) => (
              <View key={k.id} style={styles.listItem}>
                <Text>
                  {t(`pix.type.${k.type}`)} • {k.value}
                </Text>
                <View style={[styles.row, { marginTop: 6 }]}>
                  <TouchableOpacity
                    style={styles.smallBtn}
                    onPress={async () => {
                      try {
                        await removeKey(k.id);
                      } catch (e: any) {
                        Alert.alert(
                          t("pix.alert.errorTitle"),
                          e?.message || t("pix.alert.errorRemovingKey")
                        );
                      }
                    }}
                  >
                    <Text style={styles.smallBtnText}>{t("pix.remove")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            {(!keys || keys.length === 0) && (
              <Text style={styles.meta}>{t("pix.noKeysYet")}</Text>
            )}
          </View>
          <Text style={{ fontWeight: "600", marginTop: 12 }}>
            {t("pix.addKeyTitle")}
          </Text>
          <View style={[styles.row, { marginTop: 8, flexWrap: "wrap" }]}>
            {(["email", "phone", "cpf", "random"] as const).map((typeId) => (
              <TouchableOpacity
                key={typeId}
                style={[styles.smallBtn, { marginRight: 8, marginBottom: 8 }]}
                onPress={() => setNewKey({ type: typeId })}
              >
                <Text style={styles.smallBtnText}>
                  {newKey.type === typeId ? "• " : ""}
                  {t(`pix.type.${typeId}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {newKey.type !== "random" && (
            <TextInput
              placeholder={
                newKey.type === "email"
                  ? t("pix.placeholders.emailExample")
                  : newKey.type === "phone"
                  ? t("pix.placeholders.phoneExample")
                  : t("pix.placeholders.cpfExample")
              }
              value={newKey.value}
              onChangeText={(t) => setNewKey((s) => ({ ...s, value: t }))}
              style={styles.input}
              autoCapitalize={newKey.type === "email" ? "none" : "none"}
              keyboardType={
                newKey.type === "phone" || newKey.type === "cpf"
                  ? "number-pad"
                  : "email-address"
              }
            />
          )}
          <TouchableOpacity
            style={styles.btn}
            onPress={async () => {
              try {
                await addKey(newKey.type, newKey.value);
                setNewKey({ type: "random", value: undefined });
              } catch (e: any) {
                Alert.alert(
                  t("pix.alert.errorTitle"),
                  e?.message || t("pix.alert.errorAddingKey")
                );
              }
            }}
            accessibilityRole="button"
          >
            <Text style={styles.btnText}>
              {t("pix.addKeyButton")} {t(`pix.type.${newKey.type}`)}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {section === "favorites" && (
        <View style={styles.card}>
          <Text style={{ fontWeight: "600" }}>{t("pix.favoritesTitle")}</Text>
          <View style={{ marginTop: 8 }}>
            {(favorites || []).map((f) => (
              <View key={f.id} style={styles.listItem}>
                <Text>
                  {f.alias} • {f.keyValue}
                </Text>
                <View style={[styles.row, { marginTop: 6 }]}>
                  <TouchableOpacity
                    style={styles.smallBtn}
                    onPress={async () => {
                      try {
                        await removeFav(f.id);
                      } catch (e: any) {
                        Alert.alert(
                          t("pix.alert.errorTitle"),
                          e?.message || t("pix.alert.errorRemovingFavorite")
                        );
                      }
                    }}
                  >
                    <Text style={styles.smallBtnText}>{t("pix.remove")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            {(!favorites || favorites.length === 0) && (
              <Text style={styles.meta}>{t("pix.noFavoritesYet")}</Text>
            )}
          </View>
          <Text style={{ fontWeight: "600", marginTop: 12 }}>
            {t("pix.addFavoriteTitle")}
          </Text>
          <TextInput
            placeholder={t("pix.alias")}
            value={newFav.alias}
            onChangeText={(t) => setNewFav((s) => ({ ...s, alias: t }))}
            style={styles.input}
          />
          <TextInput
            placeholder={t("pix.pixKey")}
            value={newFav.key}
            onChangeText={(t) => setNewFav((s) => ({ ...s, key: t }))}
            style={styles.input}
            autoCapitalize="none"
          />
          <TextInput
            placeholder={t("pix.nameOptional")}
            value={newFav.name}
            onChangeText={(t) => setNewFav((s) => ({ ...s, name: t }))}
            style={styles.input}
          />
          <TouchableOpacity
            style={styles.btn}
            onPress={async () => {
              if (!newFav.alias || !newFav.key) return;
              try {
                await addFav(
                  newFav.alias,
                  newFav.key,
                  newFav.name || undefined
                );
                setNewFav({ alias: "", key: "", name: "" });
              } catch (e: any) {
                Alert.alert(
                  t("pix.alert.errorTitle"),
                  e?.message || t("pix.alert.errorAddingFavorite")
                );
              }
            }}
          >
            <Text style={styles.btnText}>{t("common.add")}</Text>
          </TouchableOpacity>
        </View>
      )}

      {section === "history" && (
        <View style={styles.card}>
          <Text style={{ fontWeight: "600" }}>{t("pix.tabs.history")}</Text>
          <FlatList
            data={transfers}
            keyExtractor={(i) => i.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <Text>
                  {item.method === "qr" ? t("pix.viaQr") : t("pix.viaKey")} •{" "}
                  {formatCurrency(item.amount)} • {item.status}
                </Text>
                <Text style={styles.meta}>
                  {item.description || item.toKey}
                </Text>
              </View>
            )}
          />
          {!!loadingText && <Text style={styles.meta}>{loadingText}</Text>}
        </View>
      )}

      {section === "limits" && (
        <View style={styles.card}>
          <Text style={{ fontWeight: "600" }}>{t("pix.limitsTitle")}</Text>
          <Text style={{ marginTop: 6 }}>
            {t("pix.currentDaily")}:{" "}
            {limits ? formatCurrency(limits.dailyLimitCents) : "-"}
          </Text>
          <Text>
            {t("pix.currentNightly")}:{" "}
            {limits ? formatCurrency(limits.nightlyLimitCents) : "-"}
          </Text>
          <Text>
            {t("pix.currentPerTransfer")}:{" "}
            {limits ? formatCurrency(limits.perTransferLimitCents) : "-"}
          </Text>
          <TextInput
            placeholder={t("pix.newDailyLimit")}
            value={limitsEdit.daily}
            onChangeText={(t) => setLimitsEdit((s) => ({ ...s, daily: t }))}
            style={styles.input}
            keyboardType="decimal-pad"
          />
          <TextInput
            placeholder={t("pix.newNightlyLimit")}
            value={limitsEdit.nightly}
            onChangeText={(t) => setLimitsEdit((s) => ({ ...s, nightly: t }))}
            style={styles.input}
            keyboardType="decimal-pad"
          />
          <TextInput
            placeholder={t("pix.newPerTransferLimit")}
            value={limitsEdit.per}
            onChangeText={(t) => setLimitsEdit((s) => ({ ...s, per: t }))}
            style={styles.input}
            keyboardType="decimal-pad"
          />
          <TouchableOpacity style={styles.btn} onPress={applyLimits}>
            <Text style={styles.btnText}>{t("pix.updateLimits")}</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
};
