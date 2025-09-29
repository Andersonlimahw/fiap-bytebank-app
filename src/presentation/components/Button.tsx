import React, { useMemo, useRef } from 'react';
import { Text, GestureResponderEvent, ViewStyle, TextStyle, Animated, Pressable, ActivityIndicator, View } from 'react-native';
import { useTheme } from '@presentation/theme/theme';
import { makeButtonStyles } from '@components/Button.styles';

type Props = {
  title: string;
  onPress?: (e: GestureResponderEvent) => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  loading?: boolean;
};

export const Button: React.FC<Props> = ({ title, onPress, style, textStyle, disabled, loading }) => {
  const theme = useTheme();
  const styles = useMemo(() => makeButtonStyles(theme), [theme]);
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.spring(scale, { toValue: 0.98, useNativeDriver: true, speed: 20, bounciness: 0 }).start();
  };
  const pressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 6 }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }], opacity: disabled || loading ? 0.8 : 1 }}>
      <Pressable
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        disabled={disabled || loading}
        style={({ pressed }) => [styles.btn, pressed && styles.btnPressed, style]}
        accessibilityRole="button"
        accessibilityLabel={title}
        hitSlop={8}
      >
        <View style={styles.innerRow}>
          {loading ? <ActivityIndicator color={theme.colors.cardText} style={styles.activityIndicator} /> : null}
          <Text style={[styles.text, textStyle]}>{title}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};
