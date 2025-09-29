import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TextInput, TextInputProps, View, Text, StyleProp, TextStyle, Animated, Pressable } from 'react-native';
import { useTheme } from '../theme/theme';
import { makeInputStyles } from './Input.styles';
import { useI18n } from '../i18n/I18nProvider';

type Props = TextInputProps & {
  label?: string;
  errorText?: string | null;
  showPasswordToggle?: boolean;
};

export const Input: React.FC<Props> = ({ label, errorText, style, onFocus, onBlur, showPasswordToggle, secureTextEntry, ...rest }) => {
  const theme = useTheme();
  const { t } = useI18n();
  const styles = useMemo(() => makeInputStyles(theme), [theme]);
  const [focused, setFocused] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current; // 0: blur, 1: focus
  const shake = useRef(new Animated.Value(0)).current;
  const [hide, setHide] = useState(!!secureTextEntry);

  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: focused ? 1 : 0,
      duration: 160,
      useNativeDriver: false,
    }).start();
  }, [focused, focusAnim]);

  useEffect(() => {
    if (!errorText) return;
    shake.setValue(0);
    Animated.sequence([
      Animated.timing(shake, { toValue: 1, duration: 40, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -1, duration: 70, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 1, duration: 70, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 40, useNativeDriver: true }),
    ]).start();
  }, [errorText, shake]);

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [errorText ? theme.colors.danger : theme.colors.border, theme.colors.primary],
  });
  const bgColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.background, theme.colors.surface],
  });

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={[styles.label, focused && styles.labelFocused]}>{label}</Text> : null}
      <Animated.View
        style={{
          transform: [{ translateX: shake.interpolate({ inputRange: [-1, 1], outputRange: [-4, 4] }) }],
        }}
      >
        <Animated.View style={[styles.input, { borderColor, backgroundColor: bgColor }, errorText ? styles.inputError : undefined, style as StyleProp<TextStyle>] as any}>
          <TextInput
            style={styles.inputInner}
            placeholderTextColor={theme.colors.muted}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            secureTextEntry={showPasswordToggle ? hide : secureTextEntry}
            {...rest}
          />
          {showPasswordToggle && secureTextEntry ? (
            <Pressable
              onPress={() => setHide((v) => !v)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={hide ? t('auth.showPassword') : t('auth.hidePassword')}
            >
              <Text style={styles.toggle}>{hide ? t('common.show') : t('common.hide')}</Text>
            </Pressable>
          ) : null}
        </Animated.View>
      </Animated.View>
      {!!errorText && <Text style={styles.error}>{errorText}</Text>}
    </View>
  );
};
