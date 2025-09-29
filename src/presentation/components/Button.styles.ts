import { Platform, StyleSheet } from 'react-native';
import type { AppTheme } from '../theme/theme';

export const makeButtonStyles = (theme: AppTheme) =>
  StyleSheet.create({
    btn: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: theme.radius.md,
      ...(Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
        },
        android: {
          elevation: 2,
        },
        default: {},
      }) as object),
    },
    btnPressed: { transform: [{ scale: 0.98 }] as any },
    innerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    text: { color: theme.colors.cardText, fontWeight: '600', textAlign: 'center', fontFamily: theme.fonts.medium },
    activityIndicator: { marginRight: theme.spacing.sm },
  });
