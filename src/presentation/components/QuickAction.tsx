import React, { useMemo, useRef } from 'react';
import { Image, Text, ViewStyle, ImageSourcePropType, Animated, Pressable, Vibration } from 'react-native';
import { useTheme } from '../theme/theme';
import { makeQuickActionStyles } from './QuickAction.styles';

type Props = {
  label: string;
  icon: ImageSourcePropType;
  onPress?: () => void;
  style?: ViewStyle;
};

export const QuickAction: React.FC<Props> = ({ label, icon, onPress, style }) => {
  const theme = useTheme();
  const styles = useMemo(() => makeQuickActionStyles(theme), [theme]);
  const scale = useRef(new Animated.Value(1)).current;
  const pressIn = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 24, bounciness: 0 }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 16, bounciness: 6 }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        onLongPress={() => Vibration.vibrate(15)}
        style={({ pressed }) => [styles.container, pressed && styles.containerPressed, style]}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Image source={icon} style={styles.icon} />
        <Text style={styles.label}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
};

/** styles moved to QuickAction.styles.ts */
