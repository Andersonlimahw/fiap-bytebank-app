import { StyleSheet } from 'react-native';
import type { AppTheme } from '../../theme/theme';

export const makePixStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: { padding: theme.spacing.lg },
    sectionTitle: { fontSize: theme.text.h2, fontWeight: '600', color: theme.colors.text, marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm, fontFamily: theme.fonts.bold },
    row: { flexDirection: 'row', alignItems: 'center' },
    actionsRow: { paddingVertical: theme.spacing.sm },
    action: { alignItems: 'center', justifyContent: 'center', padding: theme.spacing.md, backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, minWidth: 96 },
    actionLabel: { marginTop: 6, color: theme.colors.text, fontFamily: theme.fonts.medium },
    actionGap: { marginLeft: theme.spacing.sm },
    card: { backgroundColor: theme.colors.background, borderRadius: theme.radius.lg, padding: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.border },
    input: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, padding: 12, marginTop: 8 },
    btn: { marginTop: 12, backgroundColor: theme.colors.primary, paddingVertical: 12, borderRadius: theme.radius.md, alignItems: 'center' },
    btnText: { color: theme.colors.cardText, fontWeight: '600', fontFamily: theme.fonts.medium },
    listItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    smallBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: theme.colors.surface, borderRadius: theme.radius.md },
    smallBtnText: { color: theme.colors.text, fontFamily: theme.fonts.medium },
    meta: { color: theme.colors.muted, fontSize: 12, fontFamily: theme.fonts.regular },
    qrBox: { marginTop: 8, padding: 12, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface },
  });
