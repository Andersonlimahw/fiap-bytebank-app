import { Platform, StyleSheet } from 'react-native';
import type { AppTheme } from '../theme/theme';

export const makeQuickActionStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      width: 88,
      height: 88,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.sm,
      ...(Platform.OS === 'ios'
        ? { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } }
        : { elevation: 1 }),
    },
    containerPressed: { opacity: 0.95 },
    icon: { width: 28, height: 28, resizeMode: 'contain', marginBottom: 6 },
    label: { fontSize: 12, fontWeight: '600', textAlign: 'center', color: theme.colors.text, fontFamily: theme.fonts.medium },
  });
