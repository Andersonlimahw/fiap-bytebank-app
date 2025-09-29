import { StyleSheet } from 'react-native';
import type { AppTheme } from '../theme/theme';

export const makeTransactionItemStyles = (theme: AppTheme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    rowPressed: { backgroundColor: theme.colors.surface },
    title: { fontWeight: '600', fontSize: 16, color: theme.colors.text, fontFamily: theme.fonts.medium },
    date: { color: theme.colors.muted, marginTop: 2, fontFamily: theme.fonts.regular },
    category: { color: theme.colors.accent, marginTop: 2, fontSize: 12, fontFamily: theme.fonts.medium },
    amount: { fontWeight: '700', textAlign: 'right', fontFamily: theme.fonts.bold },
    amountWrap: {
      minWidth: 96,
      paddingLeft: theme.spacing.sm,
      alignItems: 'flex-end',
      justifyContent: 'center',
      alignSelf: 'center',
      flexShrink: 0,
    },
    content: { flex: 1, minWidth: 0, paddingRight: theme.spacing.lg },
  });
