import { StyleSheet } from "react-native";
import type { AppTheme } from "@presentation/theme/theme";

export const makeInvestmentsStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    addForm: {
      padding: 16,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    input: {
      height: 40,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: theme.radius.sm,
      paddingHorizontal: 10,
      marginBottom: 10,
      backgroundColor: theme.colors.surface,
      color: theme.colors.text,
    },
    error: {
      color: theme.colors.danger,
      textAlign: "center",
      padding: 10,
    },
    loader: {
      marginTop: 50,
    },
    list: {
      paddingVertical: 8,
    },
    emptyListContainer: {
      alignItems: "center",
      marginTop: 50,
    },
    emptyListText: {
      fontSize: 16,
      color: theme.colors.muted,
    },
    suggestionsList: {
      position: "absolute",
      top: 40, // Position right below the input
      left: 0,
      right: 0,
      maxHeight: 150,
      backgroundColor: theme.colors.surface,
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.sm,
      marginTop: 4,
    },
    suggestionItem: {
      padding: 10,
      fontWeight: "bold",
      fontStyle: "italic",
      borderBottomWidth: 2,
      borderBottomColor: theme.colors.border,
    },
    suggestionText: {
      fontSize: 14,
      color: theme.colors.text,
    },
  });
