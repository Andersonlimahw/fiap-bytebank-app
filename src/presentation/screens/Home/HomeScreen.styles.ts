import { Platform, StyleSheet } from "react-native";
import type { AppTheme } from "@presentation/theme/theme";

export const makeHomeStyles = (theme: AppTheme) =>
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
      fontFamily: theme.fonts.bold,
    },
    signOut: {
      color: theme.colors.accent,
      marginTop: theme.spacing.sm,
      fontFamily: theme.fonts.medium,
    },
    sectionTitle: {
      fontWeight: "700",
      fontSize: 16,
      marginBottom: theme.spacing.sm,
      color: theme.colors.text,
      fontFamily: theme.fonts.bold,
    },
    actionsRow: { paddingVertical: theme.spacing.sm },
    actionGap: { marginLeft: theme.spacing.md },
  });
