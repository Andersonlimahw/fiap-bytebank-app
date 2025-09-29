import { StyleSheet } from 'react-native';
import type { AppTheme } from '../theme/theme';

export const makeDigitalCardStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      width: 300,
      height: 180,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      justifyContent: 'space-between',
      overflow: 'hidden',
    },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    brandText: { color: '#fff', fontWeight: '800', fontSize: 18, letterSpacing: 0.5 },
    number: { color: '#fff', fontSize: 22, letterSpacing: 2, fontFamily: theme.fonts.medium },
    label: { color: '#d1d5db', fontSize: 10, marginBottom: 2 },
    value: { color: '#fff', fontSize: 12, fontWeight: '700' },
    chip: { width: 42, height: 30, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.9)' },
    cornerGlow: { position: 'absolute', width: 260, height: 260, borderRadius: 130, opacity: 0.35 },
    gradientOverlay: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, opacity: 0.25 },
    nickname: { color: '#e5e7eb', fontSize: 12, marginTop: 2 },
  });
