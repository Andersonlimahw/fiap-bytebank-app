import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '../theme/theme';

type Props = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
};

export const EmptyStateBanner: React.FC<Props> = ({ title, description, actionLabel, onAction, style }) => {
  const theme = useTheme();
  const styles = useMemo(() => ({
    container: {
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.lg,
      alignItems: 'center',
    } as ViewStyle,
    title: { color: theme.colors.text, fontSize: 16, fontWeight: '700', textAlign: 'center' } as any,
    desc: { color: theme.colors.muted, fontSize: 13, marginTop: 8, textAlign: 'center' } as any,
    action: {
      marginTop: theme.spacing.md,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radius.sm,
      paddingHorizontal: 14,
      paddingVertical: 10,
    } as ViewStyle,
    actionText: { color: theme.colors.cardText, fontWeight: '700' } as any,
  }), [theme]);

  return (
    <View style={[styles.container, style]}
      accessibilityRole="summary" accessibilityLabel={title}>
      <Text style={styles.title}>{title}</Text>
      {!!description && <Text style={styles.desc}>{description}</Text>}
      {!!actionLabel && !!onAction && (
        <TouchableOpacity onPress={onAction} style={styles.action}
          accessibilityRole="button" accessibilityLabel={actionLabel}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

