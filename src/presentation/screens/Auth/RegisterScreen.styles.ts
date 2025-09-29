import { StyleSheet } from 'react-native';
import type { AppTheme } from '../../theme/theme';

export const makeRegisterStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: { flex: 1, padding: theme.spacing.xl, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background },
    illustration: { width: 160, height: 160, resizeMode: 'contain', marginBottom: theme.spacing.md },
    title: { fontSize: theme.text.h1, fontWeight: '700', color: theme.colors.text },
    subtitle: { color: theme.colors.muted, marginTop: 4, marginBottom: theme.spacing.md },
    link: { marginTop: theme.spacing.md, color: theme.colors.primary },
  });
