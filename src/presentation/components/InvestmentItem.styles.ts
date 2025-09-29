import { StyleSheet } from "react-native";
import type { AppTheme } from "@store/themeStore";

export const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      padding: theme.spacing.lg,
      alignItems: "center",
      backgroundColor: theme.colors.surface,
    },
    logo: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: theme.spacing.md,
    },
    infoContainer: {
      flex: 1,
      justifyContent: "center",
    },
    ticker: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.colors.text,
    },
    name: {
      fontSize: 14,
      color: theme.colors.muted,
      maxWidth: "80%",
      overflow: "hidden",
    },
    quantity: {
      fontSize: 12,
      color: theme.colors.muted,
      marginTop: 2,
    },
    priceContainer: {
      alignItems: "flex-end",
    },
    price: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.colors.text,
    },
    change: {
      fontSize: 14,
      marginTop: 2,
    },
    positive: {
      color: theme.colors.success,
    },
    negative: {
      color: theme.colors.danger,
    },
    regularMarketPrice: {
      fontSize: 14,
      color: theme.colors.muted,
      fontStyle: "italic",
      marginVertical: 8,
    },
  });
