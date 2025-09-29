import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

export function useFadeSlideInOnFocus(opts?: { offset?: number; duration?: number }) {
  const offset = opts?.offset ?? 12;
  const duration = opts?.duration ?? 260;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(offset)).current;

  useFocusEffect(
    useMemo(
      () => () => {
        opacity.setValue(0);
        translateY.setValue(offset);
        Animated.parallel([
          Animated.timing(opacity, { toValue: 1, duration, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
          Animated.timing(translateY, { toValue: 0, duration, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
        ]).start();
      },
      [duration, offset, opacity, translateY]
    )
  );

  return {
    animatedStyle: {
      opacity,
      transform: [{ translateY }],
    },
  } as const;
}

export function useScaleFadeIn(trigger?: any, opts?: { fromScale?: number; duration?: number }) {
  const fromScale = opts?.fromScale ?? 0.92;
  const duration = opts?.duration ?? 280;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(fromScale)).current;

  useEffect(() => {
    opacity.setValue(0);
    scale.setValue(fromScale);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 12, bounciness: 6 }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  return {
    animatedStyle: {
      opacity,
      transform: [{ scale }],
    },
  } as const;
}

export function useChartEntranceAndPulse(trigger?: any, opts?: { fromScale?: number; pulseScale?: number }) {
  const fromScale = opts?.fromScale ?? 0.9;
  const pulseScale = opts?.pulseScale ?? 1.03;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(fromScale)).current;

  useEffect(() => {
    opacity.setValue(0);
    scale.setValue(fromScale);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 6 }),
      ]),
      Animated.loop(
        Animated.sequence([
          Animated.timing(scale, { toValue: pulseScale, duration: 900, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
          Animated.timing(scale, { toValue: 1, duration: 900, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
        ])
      ),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  return {
    animatedStyle: {
      opacity,
      transform: [{ scale }],
    },
  } as const;
}
