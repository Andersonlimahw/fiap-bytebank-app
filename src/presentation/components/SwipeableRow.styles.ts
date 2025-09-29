import { Platform, StyleSheet } from 'react-native';
import type { AppTheme } from '../theme/theme';

export const makeSwipeableRowStyles = (theme: AppTheme) =>
  StyleSheet.create({
    wrapper: { width: '100%', overflow: 'hidden' },
    actions: {
      position: 'absolute',
      right: 0,
      top: 0,
      bottom: 0,
      flexDirection: 'row',
      paddingRight: 8,
      // Fill background to prevent underlying text appearing between buttons
      backgroundColor: theme.colors.background,
    },
    actionBtn: {
      width: 56,
      height: 44,
      marginVertical: 8,
      marginLeft: 8,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      // Subtle iOS-like shadow
      ...(Platform.OS === 'ios'
        ? { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } }
        : { elevation: 2 }),
    },
    deleteHint: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      backgroundColor: theme.colors.danger,
      alignItems: 'flex-end',
      justifyContent: 'center',
      paddingRight: 20,
    },
  });
