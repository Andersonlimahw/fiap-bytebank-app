import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@presentation/theme/theme';
import { useI18n } from '@presentation/i18n/I18nProvider';

export type ChartDatum = {
  label: string; // already translated or key handled by caller
  value: number; // absolute value in cents or unit
};

type Props = {
  data: ChartDatum[];
  total?: number; // optional total; if not provided, sum of values is used
  formatValue?: (v: number) => string; // format function; default raw number
  testID?: string;
};

export const HorizontalBarChart: React.FC<Props> = ({ data, total, formatValue, testID }) => {
  const theme = useTheme();
  const { t } = useI18n();

  const sum = useMemo(() => (typeof total === 'number' ? total : data.reduce((s, d) => s + d.value, 0)), [data, total]);
  const colors = useMemo(() => buildPalette(theme), [theme]);

  if (!data || data.length === 0 || sum <= 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]} testID={testID}>
        <Text style={[styles.noData, { color: theme.colors.muted }]}>{t('charts.noData')}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]} testID={testID}>
      {data.map((d, idx) => {
        const pct = sum > 0 ? Math.max(0, Math.min(100, (d.value / sum) * 100)) : 0;
        const barColor = colors[idx % colors.length];
        return (
          <View key={`${d.label}-${idx}`} style={styles.row}>
            <View style={styles.rowHeader}>
              <Text style={[styles.label, { color: theme.colors.text }]} numberOfLines={1}>
                {d.label}
              </Text>
              <Text style={[styles.value, { color: theme.colors.muted }]}>
                {formatValue ? formatValue(d.value) : String(d.value)}
              </Text>
            </View>
            <View style={[styles.track, { backgroundColor: theme.colors.border }]}
              accessibilityRole="progressbar"
              accessibilityValue={{ now: Math.round(pct), min: 0, max: 100 }}
            >
              <View style={[styles.fill, { width: `${pct}%`, backgroundColor: barColor }]} />
            </View>
          </View>
        );
      })}
    </View>
  );
};

function buildPalette(theme: ReturnType<typeof useTheme>): string[] {
  // A simple, high-contrast palette leveraging theme
  const c = theme.colors;
  return [c.primary, c.accent, c.success, c.danger, c.text, '#8B5CF6', '#14B8A6', '#F59E0B'];
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 12,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  row: { marginBottom: 12 },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  label: { fontWeight: '600', flex: 1, marginRight: 8 },
  value: { fontSize: 12 },
  track: { width: '100%', height: 10, borderRadius: 8, overflow: 'hidden' },
  fill: { height: '100%' },
  noData: { textAlign: 'center', fontStyle: 'italic' },
});

export default HorizontalBarChart;

