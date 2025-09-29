import { StyleSheet, Platform } from "react-native";
import type { AppTheme } from "@presentation/theme/theme";

export const makeDigitalCardsStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.lg,
      alignItems: "center",
      backgroundColor: theme.colors.background,
    },
    modal: {
      flex: 1,
      justifyContent: "center",
      paddingTop: theme.spacing.xl + (Platform.OS === "ios" ? 24 : 0),
      margin: theme.spacing.md,
      padding: theme.spacing.md,
    },
    row: { flexDirection: "row", alignItems: "center" },
    list: { paddingVertical: theme.spacing.md },
    cardItem: { marginBottom: theme.spacing.md },
    emptyText: {
      textAlign: "center",
      color: theme.colors.muted,
      marginTop: theme.spacing.lg,
    },
    fab: {
      position: "absolute",
      right: 20,
      bottom: 28,
      backgroundColor: theme.colors.primary,
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
    },
    fabText: { color: theme.colors.cardText, fontSize: 24, fontWeight: "700" },
    title: {
      fontSize: 20,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
      marginTop: theme.spacing.xl,
    },
    form: {
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.background,
      flex: 1,
      paddingBlock: theme.spacing.lg,
      paddingTop: theme.spacing.xl,
      paddingBottom: theme.spacing.lg,
    },
    field: { marginBottom: theme.spacing.md },
    label: { color: theme.colors.muted, marginBottom: 6 },
    input: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.sm,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: theme.colors.text,
      backgroundColor: theme.colors.surface,
    },
    actions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: theme.spacing.md,
    },
    btn: {
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: theme.radius.sm,
    },
    btnCancel: {
      backgroundColor: theme.colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      marginRight: 8,
    },
    btnSave: { backgroundColor: theme.colors.primary },
    btnText: { color: theme.colors.cardText, fontWeight: "700" },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    editRemoveRow: { flexDirection: "row", gap: 12, marginTop: 8 },
    smallLink: { color: theme.colors.accent, fontWeight: "600" },
    modalHeader: {
      paddingTop: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
  });
