import { StyleSheet } from 'react-native';
import type { AppTheme } from '../../theme/theme';

export const makeUserStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.lg, paddingBottom: theme.spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    title: { fontSize: 20, fontWeight: '700', color: theme.colors.text, fontFamily: theme.fonts.bold },
    section: { paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.md },
    sectionTitle: { fontSize: 14, fontWeight: '700', color: theme.colors.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8, fontFamily: theme.fonts.medium },
    card: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, padding: theme.spacing.md },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
    label: { fontSize: 14, color: theme.colors.muted, fontFamily: theme.fonts.regular },
    value: { fontSize: 16, fontWeight: '600', color: theme.colors.text, fontFamily: theme.fonts.medium },
    divider: { height: StyleSheet.hairlineWidth, backgroundColor: theme.colors.border, marginVertical: 6 },
    link: { fontSize: 16, color: theme.colors.primary, fontWeight: '600', fontFamily: theme.fonts.medium },
    avatarRow: { flexDirection: 'row', alignItems: 'center' },
    nameBlock: { marginLeft: 12 },
    name: { fontSize: 18, fontWeight: '700', color: theme.colors.text, fontFamily: theme.fonts.bold },
    sub: { fontSize: 13, color: theme.colors.muted, fontFamily: theme.fonts.regular },
    footer: { padding: theme.spacing.md, alignItems: 'center', justifyContent: 'center' },
    version: { color: theme.colors.muted, fontSize: 12, fontFamily: theme.fonts.regular },
  });
