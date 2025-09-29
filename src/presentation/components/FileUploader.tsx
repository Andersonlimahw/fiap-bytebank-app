import React, { useCallback, useMemo, useState, useEffect, use } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  ActivityIndicator,
  Linking,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useTheme } from "@presentation/theme/theme";
import { makeFileUploaderStyles } from "./FileUploader.styles";
import { useI18n } from "@presentation/i18n/I18nProvider";
import { useFileViewModel } from "@view-models/useFileViewModel";
import { useFileUploader } from "./FileUploader.hook";
import { pingStorage } from "@data/firebase/FirebaseFileRepository";

type PickedFile = { uri: string; name: string; type?: string | null };
const isImage = (mime?: string | null) => !!mime && mime.startsWith("image/");

type Mode = "staged" | "bound";

export type FileUploaderProps = {
  /**
   * 'staged': coleta arquivos antes de existir transactionId e expõe via onStagedChange
   * 'bound' : já existe transactionId e o componente lista/enrola uploads/remover/abrir
   */
  mode: Mode;

  /** Necessário em modo 'bound' */
  transactionId?: string;

  /** Chamado quando a lista local (staged) é alterada (modo 'staged') */
  onStagedChange?: (files: PickedFile[]) => void;

  /** Limite de arquivos a selecionar por vez (opcional) */
  maxFiles?: number;

  /** Desabilita interação (opcional) */
  disabled?: boolean;

  /** Rótulo opcional para o título (senão usa i18n/files.title) */
  title?: string;
};

export const FileUploader: React.FC<FileUploaderProps> = ({
  mode,
  transactionId,
  onStagedChange,
  maxFiles = 10,
  disabled,
  title,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => makeFileUploaderStyles(theme), [theme]);
  const { t } = useI18n();
  const fileVM = useFileViewModel();

  const [picked, setPicked] = useState<PickedFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const fileUploaderHook = useFileUploader();

  // Sincroniza alterações locais com o consumidor (modo staged)
  useEffect(() => {
    if (mode === "staged") onStagedChange?.(picked);
  }, [mode, picked, onStagedChange]);

  useEffect(() => {
    if (!transactionId || mode !== "bound") return;
    fileVM.refresh(transactionId!);
  }, [fileVM.refresh, transactionId]);

  const handleDocumentPicking = useCallback(async () => {
    try {
      console.log("handleDocumentPicking: starting file selection");
      if (disabled) return;

      const result = await DocumentPicker.getDocumentAsync({
        multiple: false,
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        console.log("handleDocumentPicking: user canceled file selection");
        return;
      }

      const results = result.assets;

      const mapped = results.map((r: any) => ({
        uri: r.uri,
        name: r.name,
        type: r.mimeType,
      })) as PickedFile[];

      console.log("handleDocumentPicking: selected files", mapped);

      // Update local state for UI
      const next = [...mapped, ...picked].slice(0, maxFiles);
      setPicked(next);

      // Handle upload based on mode
      if (mode === "staged" && fileVM.user) {
        // In staged mode, just store locally for later upload
        console.log("handleDocumentPicking: staged mode - files stored locally");
      } else if (mode === "bound" && transactionId && fileVM.user) {
        // In bound mode, upload immediately
        console.log("handleDocumentPicking: bound mode - uploading immediately");
        setUploading(true);
        for (const f of mapped) {
          try {
            await fileVM.uploadFile({
              transactionId,
              fileUri: f.uri,
              fileName: f.name,
              mimeType: f.type || undefined,
              userId: fileVM.user.id,
            });
            console.log("handleDocumentPicking: uploaded file successfully", f.name);
          } catch (e: any) {
            console.error("handleDocumentPicking: upload failed for", f.name, e?.message);
          }
        }
        setUploading(false);
        // Refresh the file list
        fileVM.refresh(transactionId);
      }
    } catch (err: any) {
      console.error("handleDocumentPicking: error", err);
      Alert.alert(
        t("common.errorTitle") || "Erro",
        err?.message || "Falha ao selecionar arquivos"
      );
    }
  }, [disabled, picked, maxFiles, mode, transactionId, fileVM, t]);

  const removeLocal = useCallback(
    (index: number) => {
      if (disabled) return;
      setPicked((prev) => prev.filter((_, i) => i !== index));
    },
    [disabled]
  );

  const openUrl = useCallback(
    async (url?: string) => {
      if (!url) return;
      try {
        await Linking.openURL(url);
      } catch {
        Alert.alert(t("common.errorTitle") || "Erro", t("files.cannotOpen"));
      }
    },
    [t]
  );

  const removeRemote = useCallback(
    async (id: string) => {
      if (disabled) return;
      const item = fileVM.files.find((f) => f.id === id);
      if (!item) return;
      try {
        await fileVM.deleteFile(item);
      } catch (e: any) {
        Alert.alert(
          t("common.errorTitle") || "Erro",
          e?.message || t("common.update")
        );
      }
    },
    [disabled, fileVM, t]
  );

  const pickFiles = useCallback(async () => {
    if (disabled) return;

    try {
      console.log("pickFiles: starting simplified file picking flow");

      // Verificar conectividade com Firebase Storage
      pingStorage();

      // expo-document-picker com copyToCacheDirectory não precisa de permissões
      // pois usa o System Document Picker e copia para cache interno
      console.log("pickFiles: proceeding with file selection (no permissions needed)");

      // Use the unified document picking function
      await handleDocumentPicking();

    } catch (error: any) {
      console.error("pickFiles: error in simplified flow", error);
      setUploading(false);
      Alert.alert(
        t("common.errorTitle") || "Erro",
        error?.message || "Falha ao processar arquivos"
      );
    }
  }, [disabled, handleDocumentPicking, t]);

  const titleLabel = title ?? t("files.title");
  useEffect(() => {
    pingStorage();
  }, [picked, transactionId, uploading]);

  return (
    <View
      style={styles.container}
      accessible
      accessibilityLabel={t("files.sectionLabel")}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>{titleLabel}</Text>

        <TouchableOpacity
          style={styles.pickBtn}
          accessibilityRole="button"
          accessibilityLabel={t("files.addFiles")}
          accessibilityHint={
            t("files.addFilesHint") || "Abre o seletor de documentos"
          }
          onPress={pickFiles}
          disabled={disabled}
        >
          <Text style={styles.pickBtnText}>
            {t("files.addFiles") || "Adicionar"}
          </Text>
        </TouchableOpacity>
      </View>
      {uploading && (
        <View style={styles.uploadingRow}>
          <ActivityIndicator />
          <Text style={styles.uploadingText}>
            {t("files.uploading") || "Enviando..."}
          </Text>
        </View>
      )}

      {/* STAGED: aguardando salvar transação */}
      {mode === "staged" && picked.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>{t("files.pendingToUpload")}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scroll}
          >
            <View style={styles.listRow}>
              {picked.map((f, idx) => (
                <View key={`${f.uri}-${idx}`} style={styles.item}>
                  {isImage(f.type) ? (
                    <Image source={{ uri: f.uri }} style={styles.thumb} />
                  ) : (
                    <View style={styles.nonImage}>
                      <Text style={styles.nonImageText} numberOfLines={2}>
                        {f.name || "arquivo"}
                      </Text>
                    </View>
                  )}
                  <View style={styles.actions}>
                    <TouchableOpacity onPress={() => openUrl(f.uri)}>
                      <Text style={styles.actionText}>{t("common.open")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeLocal(idx)}>
                      <Text style={[styles.actionText, styles.dangerText]}>
                        {t("common.remove")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </>
      )}

      {/* BOUND: já enviados no Storage (gerenciados pelo VM — exige transactionId) */}
      {mode === "bound" && fileVM.files.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>{t("files.alreadyUploaded")}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scroll}
          >
            <View style={styles.listRow}>
              {fileVM.files.map((file) => (
                <View key={file.id} style={styles.item}>
                  {isImage(file.mimeType) ? (
                    <Image
                      source={{ uri: file.downloadUrl }}
                      style={styles.thumb}
                    />
                  ) : (
                    <View style={styles.nonImage}>
                      <Text style={styles.nonImageText} numberOfLines={2}>
                        {file.mimeType?.split("/")[1] || "arquivo"}
                      </Text>
                    </View>
                  )}
                  <View style={styles.actions}>
                    <TouchableOpacity onPress={() => openUrl(file.downloadUrl)}>
                      <Text style={styles.actionText}>{t("common.open")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeRemote(file.id)}>
                      <Text style={[styles.actionText, styles.dangerText]}>
                        {t("common.delete")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </>
      )}

      <Text style={styles.hint}>{t("files.privacyHint")}</Text>
    </View>
  );
};
