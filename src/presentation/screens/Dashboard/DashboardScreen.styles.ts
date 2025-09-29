import { Platform, StyleSheet } from "react-native";
import type { AppTheme } from "@presentation/theme/theme";

export const makeDashboardStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.lg,
    },
    hello: { color: theme.colors.muted, fontFamily: theme.fonts.regular },
    username: {
      fontSize: theme.text.h2,
      fontWeight: "700",
      color: theme.colors.text,
      fontFamily: theme.fonts.bold,
    },
    avatar: { width: 40, height: 40, borderRadius: 20 },
    banner: {
      width: "100%",
      height: 180,
      resizeMode: "cover",
      borderRadius: theme.radius.md,
      marginBottom: theme.spacing.lg,
      ...(Platform.OS === "ios"
        ? {
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 3 },
          }
        : { elevation: 1 }),
    },
    card: {
      backgroundColor: theme.colors.card,
      padding: theme.spacing.lg,
      borderRadius: theme.radius.md,
      marginBottom: theme.spacing.lg,
      ...(Platform.OS === "ios"
        ? {
            shadowColor: "#000",
            shadowOpacity: 0.12,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 3 },
          }
        : { elevation: 2 }),
    },
    cardLabel: { color: theme.colors.muted, fontFamily: theme.fonts.regular },
    cardValue: {
      color: theme.colors.cardText,
      fontSize: 28,
      fontWeight: "800",
      marginTop: 6,
      marginBottom: theme.spacing.md,
      fontFamily: theme.fonts.bold,
    },
    row: { flexDirection: "row", alignItems: "center" },
    smallBtn: {
      borderRadius: theme.radius.sm,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
    },
    smallBtnText: {
      color: theme.colors.cardText,
      fontWeight: "700",
      fontFamily: theme.fonts.medium,
    },
    sectionTitle: {
      fontWeight: "700",
      fontSize: 16,
      marginBottom: theme.spacing.sm,
      marginTop: theme.spacing.xs,
      color: theme.colors.text,
      fontFamily: theme.fonts.bold,
    },
    actionsRow: { paddingVertical: theme.spacing.sm },
    actionGap: { marginLeft: theme.spacing.md },
    cardImage: { width: 260, height: 160, resizeMode: "contain" },
    chart: { width: "100%", height: 200, resizeMode: "contain" },
    caption: {
      color: theme.colors.muted,
      textAlign: "center",
      marginTop: theme.spacing.sm,
      fontFamily: theme.fonts.regular,
    },
  });
