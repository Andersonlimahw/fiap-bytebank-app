import React, { useMemo, useRef, useState } from "react";
import { View, Text, ViewStyle, Animated, Pressable } from "react-native";
import type { DigitalCard } from "@domain/entities/Card";
import { useTheme } from "../theme/theme";
import { makeDigitalCardStyles } from "./DigitalCard.styles";
import { BrandLogo } from "./BrandLogo";
import { useI18n } from "../i18n/I18nProvider";

type Props = {
  card: Pick<
    DigitalCard,
    "holderName" | "number" | "cvv" | "expiry" | "brand" | "nickname"
  >;
  style?: ViewStyle;
};

export function maskNumber(num: string) {
  const digits = (num || "").replace(/\D/g, "");
  const groups = digits.match(/.{1,4}/g) || [];
  return groups
    .map((g, i) => (i < groups.length - 1 ? g.replace(/\d/g, "•") : g))
    .join(" ");
}

export function deriveBrandFromNumber(
  num?: string
): DigitalCard["brand"] | undefined {
  const digits = (num || "").replace(/\D/g, "");
  if (!digits) return undefined;
  // Basic BIN checks — not exhaustive, good enough for display purposes
  if (/^4\d{12,18}$/.test(digits)) return "visa";
  if (
    /^(5[1-5]\d{14}|2(2[2-9]\d{2}|[3-6]\d{3}|7[01]\d{2}|720\d)\d{12})$/.test(
      digits
    )
  )
    return "mastercard";
  if (/^3[47]\d{13}$/.test(digits)) return "amex";
  // Very rough heuristics for Elo/Hipercard (real BINs vary a lot)
  if (
    /^(4011|4312|4389|4514|4576|5041|5067|5090|6277|6362|650|651|652)/.test(
      digits
    )
  )
    return "elo";
  if (/^(606282|3841)/.test(digits)) return "hipercard";
  return undefined;
}

export const CardVisualView: React.FC<Props> = ({ card, style }) => {
  const theme = useTheme();
  const styles = useMemo(() => makeDigitalCardStyles(theme), [theme]);
  const { t } = useI18n();
  // Prefer explicit brand; otherwise try to infer from number
  const resolvedBrand = useMemo(
    () => card.brand || deriveBrandFromNumber(card.number) || "other",
    [card.brand, card.number]
  );

  // Flip + micro interactions
  const [flipped, setFlipped] = useState(false);
  const rotate = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const flipTo = (toBack: boolean) => {
    setFlipped(toBack);
    Animated.spring(rotate, {
      toValue: toBack ? 1 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  };
  const onPress = () => flipTo(!flipped);
  const onPressIn = () =>
    Animated.spring(scale, {
      toValue: 0.98,
      useNativeDriver: true,
      friction: 8,
    }).start();
  const onPressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();

  const frontInterpolate = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });
  const backInterpolate = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  const backgroundStyle = useMemo(() => {
    const base: ViewStyle = { backgroundColor: theme.colors.card };
    switch (resolvedBrand) {
      case "bytebank":
        return { ...base, backgroundColor: "#0f172a" } as ViewStyle;
      case "nubank":
        return { ...base, backgroundColor: "#6D28D9" } as ViewStyle;
      case "oyapal":
        return { ...base, backgroundColor: "#0EA5E9" } as ViewStyle;
      case "visa":
        return { ...base, backgroundColor: "#0A4595" } as ViewStyle;
      case "mastercard":
        return { ...base, backgroundColor: "#111827" } as ViewStyle;
      case "amex":
        return { ...base, backgroundColor: "#0E7C86" } as ViewStyle;
      case "elo":
        return { ...base, backgroundColor: "#1F2937" } as ViewStyle;
      case "hipercard":
        return { ...base, backgroundColor: "#7F1D1D" } as ViewStyle;
      default:
        return base;
    }
  }, [resolvedBrand, theme]);

  const brandText = useMemo(() => {
    if (resolvedBrand === "bytebank") return "BYTEBANK";
    if (resolvedBrand === "nubank") return "NuBank";
    if (resolvedBrand === "oyapal") return "OyaPay";
    if (resolvedBrand === "visa") return "VISA";
    if (resolvedBrand === "mastercard") return "Mastercard";
    if (resolvedBrand === "amex") return "AMERICAN EXPRESS";
    if (resolvedBrand === "elo") return "Elo";
    if (resolvedBrand === "hipercard") return "Hipercard";
    return card.nickname || "Card";
  }, [resolvedBrand, card.nickname]);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessibilityRole="button"
      accessibilityLabel={
        flipped ? t("cards.card.flipToFront") : t("cards.card.flipToBack")
      }
      accessibilityHint={t("cards.card.flipToBack")}
    >
      <Animated.View
        style={[
          styles.container,
          backgroundStyle,
          style,
          { transform: [{ scale }] },
        ]}
        accessible
        accessibilityRole="image"
        accessibilityLabel={`${brandText} ${card.nickname || ""}`.trim()}
      >
        <View
          style={[
            styles.cornerGlow,
            { top: -40, left: -40, backgroundColor: "rgba(255,255,255,0.2)" },
          ]}
        />
        <View
          style={[
            styles.cornerGlow,
            {
              bottom: -60,
              right: -60,
              backgroundColor: "rgba(255,255,255,0.15)",
            },
          ]}
        />

        {/* Front */}
        <Animated.View
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            backfaceVisibility: "hidden",
            transform: [{ rotateY: frontInterpolate }],
            padding: theme.spacing.lg,
            justifyContent: "space-between",
          }}
        >
          <View style={styles.row}>
            <View style={styles.chip} />
            <View style={{ alignItems: "flex-end" }}>
              <BrandLogo size={28} style={{ tintColor: "#fff" }} />
              {!!card.nickname && (
                <Text style={styles.nickname}>{card.nickname}</Text>
              )}
            </View>
          </View>

          <View>
            <Text style={styles.number}>{maskNumber(card.number)}</Text>
          </View>

          <View style={styles.row}>
            <View>
              <Text style={styles.label}>{t("cards.card.labelHolder")}</Text>
              <Text style={styles.value}>
                {(card.holderName || "").toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.label}>{t("cards.card.labelValidThru")}</Text>
              <Text style={styles.value}>{card.expiry}</Text>
            </View>
            <View>
              <Text style={styles.label}>{t("cards.card.labelCVV")}</Text>
              <Text style={styles.value}>
                {(card.cvv || "").replace(/\d/g, "•")}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Back */}
        <Animated.View
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            backfaceVisibility: "hidden",
            transform: [{ rotateY: backInterpolate }],
            padding: theme.spacing.lg,
            justifyContent: "space-between",
          }}
        >
          <View style={styles.row}>
            <Text style={styles.brandText}>{brandText}</Text>
            <BrandLogo size={28} style={{ tintColor: "#fff" }} />
          </View>
          <View
            style={{
              height: 40,
              backgroundColor: "rgba(0,0,0,0.0)",
              borderRadius: 6,
            }}
          />
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.label}>{t("cards.card.labelHolder")}</Text>
            <Text style={[styles.value, { fontSize: 14 }]}>
              {(card.holderName || "").toUpperCase()}
            </Text>
          </View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

export const CardVisual = React.memo(CardVisualView);
