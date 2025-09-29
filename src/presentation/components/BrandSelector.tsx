import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BrandLogo } from '@components/BrandLogo';
import { useTheme, useThemeActions, BrandId } from '@presentation/theme/theme';
import { getAvailableBrands } from '@presentation/theme/theme';
import { useI18n } from '@presentation/i18n/I18nProvider';

type Props = { compact?: boolean };

export const BrandSelector: React.FC<Props> = ({ compact = false }) => {
  const theme = useTheme();
  const { setBrand } = useThemeActions();
  const brands = useMemo(() => getAvailableBrands(), []);
  const { t } = useI18n();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: { flexDirection: 'row', alignItems: 'center' },
        chip: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.sm,
          backgroundColor: theme.colors.surface,
        },
        chipActive: { borderColor: theme.colors.primary },
        chipText: { marginLeft: 8, color: theme.colors.text, fontFamily: theme.fonts.medium },
        spacer: { width: 12 },
      }),
    [theme]
  );

  const displayName = (id: BrandId) => {
    // Prefer theme-specific logoText when active brand, otherwise title-case id
    if (id === theme.brand) return theme.logoText;
    return id.replace(/(^|[-_])(\w)/g, (_, __, c) => c.toUpperCase());
  };

  return (
    <View style={styles.row}>
      {brands.map((b, i) => (
        <React.Fragment key={b}>
          <TouchableOpacity
            onPress={() => setBrand(b)}
            style={[styles.chip, b === theme.brand && styles.chipActive]}
            accessibilityRole="button"
            accessibilityLabel={`${t('common.selectBrand')}: ${b}`}
          >
            <BrandLogo size={compact ? 20 : 28} brand={b} mode={theme.mode} />
            {!compact && <Text style={styles.chipText}>{displayName(b)}</Text>}
          </TouchableOpacity>
          {i < brands.length - 1 && <View style={styles.spacer} />}
        </React.Fragment>
      ))}
    </View>
  );
};
