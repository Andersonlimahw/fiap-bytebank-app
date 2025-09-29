import { StyleSheet } from 'react-native';
import type { AppTheme } from '../../theme/theme';

export const makeAddTransactionStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: { flex: 1, padding: theme.spacing.lg, backgroundColor: theme.colors.background },
    title: { fontSize: theme.text.h2, fontWeight: '700', color: theme.colors.text, marginBottom: theme.spacing.sm },
    typeRow: { flexDirection: 'row', marginTop: theme.spacing.sm, marginBottom: theme.spacing.md },
    typeBtn: { flex: 1, paddingVertical: 10, borderRadius: theme.radius.sm, borderWidth: StyleSheet.hairlineWidth, borderColor: theme.colors.border, alignItems: 'center' },
    typeBtnActive: { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary },
    typeText: { fontWeight: '600', color: theme.colors.muted },
    typeTextActive: { color: theme.colors.primary },
    typeBtnSpacer: { marginLeft: theme.spacing.sm },
  });
