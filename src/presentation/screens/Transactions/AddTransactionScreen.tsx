import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Input } from "@components/Input";
import { Button } from "@components/Button";
import { useTheme } from "@presentation/theme/theme";
import { makeAddTransactionStyles } from "./AddTransactionScreen.styles";
import type { TransactionType } from "@domain/entities/Transaction";
import type { TransactionRepository } from "@domain/repositories/TransactionRepository";
import { TOKENS } from "@core/di/container";
import { useDI } from "@store/diStore";
import { useAuth } from "@store/authStore";
import { useI18n } from "@presentation/i18n/I18nProvider";
import { FileUploader } from "@app/presentation/components/FileUploader";
import { useFileViewModel } from "@app/presentation/viewmodels/useFileViewModel";

export const AddTransactionScreen: React.FC<any> = ({ navigation }) => {
  const di = useDI();
  const repo = useMemo(
    () => di.resolve<TransactionRepository>(TOKENS.TransactionRepository),
    [di]
  );
  const { user } = useAuth();
  const theme = useTheme();
  const styles = useMemo(() => makeAddTransactionStyles(theme), [theme]);
  const { t } = useI18n();
  const fileVM = useFileViewModel();

  const [desc, setDesc] = useState("");
  const [amountText, setAmountText] = useState("");
  const [type, setType] = useState<TransactionType>("debit");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickedFiles, setPickedFiles] = useState<any[]>([]);
  const [transactionId, setTransactionId] = useState<string | undefined>(
    undefined
  );

  const saveFiles = async (transactionId: string) => {
    if (!pickedFiles || pickedFiles.length === 0) {
      console.log("No files to upload");
      return;
    }

    console.log("saveFiles: uploading", pickedFiles.length, "files for transaction", transactionId);
    setLoading(true);

    try {
      for (const file of pickedFiles) {
        console.log("Uploading file:", file.name);
        await fileVM.uploadFile({
          transactionId,
          fileUri: file.uri,
          fileName: file.name,
          mimeType: file.type || undefined,
          userId: user?.id || "",
        });
        console.log("File uploaded successfully:", file.name);
      }
      console.log("All files uploaded successfully");
    } catch (error) {
      console.error("Error uploading files:", error);
      throw error; // Re-throw to handle in save function
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    setError(null);
    if (!user) return;
    const normalized = amountText.replace(/\./g, "").replace(",", ".");
    const num = Number(normalized);
    if (!desc.trim() || isNaN(num)) {
      setError(t("transactions.errorFillDescAndValidValue"));
      return;
    }
    const cents = Math.round(num * 100);
    setLoading(true);
    console.log("AddTransaction Screen User => ", user.name);
    try {
      const newTransactionId = await repo.add({
        userId: user.id,
        description: desc.trim(),
        type,
        amount: cents,
        category: category.trim() || undefined,
      } as any);
      console.log("AddTransaction Screen Transaction ID => ", newTransactionId);

      setTransactionId(newTransactionId);

      // Upload files after transaction is created
      if (pickedFiles && pickedFiles.length > 0) {
        console.log("Uploading files for transaction:", newTransactionId);
        try {
          await saveFiles(newTransactionId);
          console.log("Files uploaded successfully");
        } catch (fileError) {
          console.error("Error uploading files:", fileError);
          Alert.alert(
            "Aviso",
            "Transação criada com sucesso, mas houve erro no upload dos arquivos. Tente novamente na edição da transação."
          );
        }
      }

      navigation?.goBack?.();
    } catch (e: any) {
      Alert.alert(
        t("common.errorTitle") || "Erro",
        e?.message ?? t("common.update")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("transactions.title")}</Text>
      <Input
        label={t("transactions.description")}
        value={desc}
        onChangeText={setDesc}
        placeholder={t("transactions.description")}
      />
      <Input
        label={t("transactions.categoryOptional")}
        value={category}
        onChangeText={setCategory}
        placeholder={t("transactions.categoryOptional")}
      />
      <Input
        label={t("transactions.valueBRL")}
        value={amountText}
        onChangeText={setAmountText}
        placeholder="0,00"
        keyboardType="decimal-pad"
        errorText={error}
      />

      <View style={styles.typeRow}>
        <TouchableOpacity
          onPress={() => setType("credit")}
          style={[
            styles.typeBtn,
            type === "credit" ? styles.typeBtnActive : undefined,
          ]}
          accessibilityRole="button"
          accessibilityLabel={t("transactions.credit")}
        >
          <Text
            style={[
              styles.typeText,
              type === "credit" ? styles.typeTextActive : undefined,
            ]}
          >
            {t("transactions.credit")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setType("debit")}
          style={[
            styles.typeBtn,
            styles.typeBtnSpacer,
            type === "debit" ? styles.typeBtnActive : undefined,
          ]}
          accessibilityRole="button"
          accessibilityLabel={t("transactions.debit")}
        >
          <Text
            style={[
              styles.typeText,
              type === "debit" ? styles.typeTextActive : undefined,
            ]}
          >
            {t("transactions.debit")}
          </Text>
        </TouchableOpacity>
      </View>

      <FileUploader mode="staged" onStagedChange={setPickedFiles} />

      <Button
        title={t("transactions.save")}
        loading={loading}
        disabled={loading}
        onPress={save}
      />
    </View>
  );
};

// styles moved to AddTransactionScreen.styles.ts
