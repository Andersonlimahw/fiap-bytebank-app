import { StyleSheet } from "react-native";
import type { AppTheme } from "@presentation/theme/theme";

export const makeFileUploaderStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      marginVertical: theme.spacing.xl,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    title: {
      fontSize: theme.text.h2,
      fontWeight: "700",
      color: theme.colors.text,
    },
    pickBtn: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 8,
      borderRadius: theme.radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    pickBtnText: {
      fontWeight: "600",
      color: theme.colors.primary,
    },
    hint: {
      marginTop: theme.spacing.xs,
      color: theme.colors.muted,
      fontSize: theme.text.body,
    },
    listRow: {
      marginTop: theme.spacing.sm,
      flexDirection: "row",
    },
    scroll: {
      flexGrow: 0,
    },
    item: {
      width: 92,
      marginRight: theme.spacing.sm,
    },
    thumb: {
      width: 92,
      height: 92,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.background,
      overflow: "hidden",
    },
    nonImage: {
      width: 92,
      height: 92,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.background,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: theme.spacing.xs,
    },
    nonImageText: {
      textAlign: "center",
      fontSize: theme.text.body,
      color: theme.colors.text,
    },
    actions: {
      marginTop: 6,
      flexDirection: "row",
      justifyContent: "space-between",
    },
    actionText: {
      fontSize: theme.text.body,
      color: theme.colors.primary,
      fontWeight: "600",
    },
    dangerText: {
      color: theme.colors.danger,
    },
    uploadingRow: {
      marginTop: theme.spacing.xs,
      flexDirection: "row",
      alignItems: "center",
    },
    uploadingText: {
      marginLeft: 6,
      color: theme.colors.muted,
      fontSize: theme.text.body,
    },
    sectionLabel: {
      marginTop: theme.spacing.sm,
      color: theme.colors.muted,
      fontSize: theme.text.body,
      fontWeight: "500",
    },
  });
