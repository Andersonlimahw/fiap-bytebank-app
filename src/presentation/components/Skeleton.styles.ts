import { StyleSheet } from 'react-native';
import type { AppTheme } from '../theme/theme';

export const makeSkeletonStyles = (theme: AppTheme) =>
  StyleSheet.create({
    base: {
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
    },
  });
