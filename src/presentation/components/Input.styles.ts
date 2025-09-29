import { Platform, StyleSheet } from 'react-native';
import type { AppTheme } from '../theme/theme';

export const makeInputStyles = (theme: AppTheme) =>
  StyleSheet.create({
    wrapper: { width: '100%', marginBottom: theme.spacing.sm },
    label: { color: theme.colors.muted, marginBottom: theme.spacing.xs, fontFamily: theme.fonts.medium },
    input: {
      width: '100%',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.sm,
      paddingHorizontal: 12,
      paddingVertical: Platform.OS === 'android' ? 0 : 2,
      flexDirection: 'row',
      alignItems: 'center',
    },
    inputInner: {
      paddingVertical: Platform.OS === 'android' ? 6 : 8,
      color: theme.colors.text,
      flex: 1,
      fontFamily: theme.fonts.regular,
    },
    inputError: { borderColor: theme.colors.danger },
    error: { color: theme.colors.danger, marginTop: theme.spacing.xs, fontFamily: theme.fonts.regular },
    labelFocused: { color: theme.colors.primary },
    toggle: { color: theme.colors.primary, fontWeight: '600', paddingHorizontal: 4, paddingVertical: 6, fontFamily: theme.fonts.medium },
  });
