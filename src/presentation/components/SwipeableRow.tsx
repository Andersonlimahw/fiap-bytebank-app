import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, View, Pressable, LayoutChangeEvent, Vibration } from 'react-native';
import { useTheme } from '../theme/theme';
import { useI18n } from '../i18n/I18nProvider';
import { makeSwipeableRowStyles } from './SwipeableRow.styles';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  children: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void; // tap on delete action
  onFullSwipeDelete?: () => void; // triggered when crossing full-swipe threshold
  rightWidth?: number; // total width of actions (overrides auto)
};

export const SwipeableRow: React.FC<Props> = ({ children, onEdit, onDelete, onFullSwipeDelete, rightWidth }) => {
  const theme = useTheme();
  const { t } = useI18n();
  const styles = useMemo(() => makeSwipeableRowStyles(theme), [theme]);
  const translateX = useRef(new Animated.Value(0)).current;
  const [open, setOpen] = useState(false);
  const [rowWidth, setRowWidth] = useState(0);
  const crossedRef = useRef(false);
  const actionsCount = (onEdit ? 1 : 0) + (onDelete ? 1 : 0);
  const autoWidth = Math.max(0, actionsCount * (56 + 8) + 8); // btn width + spacing + trailing padding
  const actionsWidth = rightWidth ?? autoWidth;

  useEffect(() => {
    const id = translateX.addListener(() => {});
    return () => translateX.removeListener(id);
  }, [translateX]);

  const clamp = (v: number) => Math.min(0, Math.max(-actionsWidth, v));

  const deleteThresholdPx = useMemo(() => Math.max(120, rowWidth * 0.6), [rowWidth]);
  const dragX = useMemo(() => Animated.multiply(translateX, -1), [translateX]);
  const hintOpacity = useMemo(
    () =>
      dragX.interpolate({
        inputRange: [0, deleteThresholdPx * 0.5, deleteThresholdPx],
        outputRange: [0, 0.15, 0.35],
        extrapolate: 'clamp',
      }),
    [dragX, deleteThresholdPx]
  );
  const hintIconScale = useMemo(
    () =>
      dragX.interpolate({
        inputRange: [0, deleteThresholdPx],
        outputRange: [0.8, 1.15],
        extrapolate: 'clamp',
      }),
    [dragX, deleteThresholdPx]
  );

  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > Math.abs(g.dy) && Math.abs(g.dx) > 6,
        onPanResponderMove: (_, g) => {
          const next = clamp((open ? -actionsWidth : 0) + g.dx);
          translateX.setValue(next);
          // Light haptic when user crosses delete threshold
          if (onDelete) {
            const deleting = -next > deleteThresholdPx;
            if (deleting && !crossedRef.current) {
              crossedRef.current = true;
              Vibration.vibrate(10);
            } else if (!deleting && crossedRef.current) {
              crossedRef.current = false;
            }
          }
        },
        onPanResponderRelease: (_, g) => {
          const eff = clamp((open ? -actionsWidth : 0) + g.dx);
          const shouldOpen = g.vx < -0.1 || (open ? g.dx < 40 : g.dx < -actionsWidth / 3);
          const willDelete = !!(onFullSwipeDelete || onDelete) && -eff > deleteThresholdPx;

          if (willDelete) {
            Animated.timing(translateX, { toValue: -rowWidth, duration: 160, useNativeDriver: true }).start(() => {
              setOpen(false);
              // Prefer full-swipe deletion callback when provided
              (onFullSwipeDelete ?? onDelete)?.();
              translateX.setValue(0);
            });
            return;
          }

          Animated.spring(translateX, {
            toValue: shouldOpen ? -actionsWidth : 0,
            useNativeDriver: true,
            speed: 18,
            bounciness: 6,
          }).start(() => setOpen(shouldOpen));
        },
        onPanResponderTerminate: () => {
          Animated.spring(translateX, { toValue: open ? -actionsWidth : 0, useNativeDriver: true, speed: 18, bounciness: 6 }).start();
        },
      }),
    [open, actionsWidth, translateX, rowWidth, onDelete, onFullSwipeDelete, deleteThresholdPx]
  );

  const close = () => {
    Animated.spring(translateX, { toValue: 0, useNativeDriver: true, speed: 18, bounciness: 6 }).start(() => setOpen(false));
  };

  const onLayout = (e: LayoutChangeEvent) => setRowWidth(e.nativeEvent.layout.width);

  return (
    <View style={styles.wrapper} onLayout={onLayout}>
      {!!(onFullSwipeDelete || onDelete) && (
        <Animated.View style={[styles.deleteHint, { opacity: hintOpacity }]}>
          <Animated.View style={{ transform: [{ scale: hintIconScale }] }}>
            <Ionicons name="trash" size={24} color={theme.colors.cardText} />
          </Animated.View>
        </Animated.View>
      )}
      <View style={[styles.actions, { width: actionsWidth }]}>        
        {onEdit ? (
          <Pressable
            style={[styles.actionBtn, { backgroundColor: theme.colors.surface }]}
            onPress={() => {
              close();
              onEdit?.();
            }}
            accessibilityRole="button"
            accessibilityLabel={t('common.edit')}
          >
            {/* iOS-like edit icon */}
            <Ionicons name="create-outline" size={22} color={theme.colors.text} />
          </Pressable>
        ) : null}
        {onDelete ? (
          <Pressable
            style={[styles.actionBtn, { backgroundColor: theme.colors.danger }]}
            onPress={() => {
              close();
              onDelete?.();
            }}
            accessibilityRole="button"
            accessibilityLabel={t('common.delete')}
          >
            {/* iOS-like trash icon */}
            <Ionicons name="trash" size={22} color={theme.colors.cardText} />
          </Pressable>
        ) : null}
      </View>
      <Animated.View style={{ transform: [{ translateX }] }} {...pan.panHandlers}>
        {children}
      </Animated.View>
    </View>
  );
};

/** styles moved to SwipeableRow.styles.ts */
