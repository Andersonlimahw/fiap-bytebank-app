import React, { useMemo } from "react";
import { Image, Text, View, StyleSheet, ImageStyle } from "react-native";
import { useTheme, BrandId, ThemeMode } from "../theme/theme";
import { brandLogos } from "../theme/brandAssets";
import { getBrandLogoText } from "@store/themeStore";

type Props = {
  size?: number;
  style?: ImageStyle | any;
  brand?: BrandId;
  mode?: ThemeMode;
};

export const BrandLogo: React.FC<Props> = ({
  size = 96,
  style,
  brand,
  mode,
}) => {
  const theme = useTheme();
  const b = brand ?? theme.brand;
  const m = mode ?? theme.mode;
  const logo = brandLogos[b]?.[m];
  const styles = useMemo(
    () =>
      StyleSheet.create({
        text: {
          fontSize: Math.round(size / 3),
          fontWeight: "800",
          color: theme.colors.primary,
          fontFamily: theme.fonts.bold,
        },
        img: { width: size, height: size, resizeMode: "contain" },
      }),
    [theme, size]
  );
  return (
    <View>
      {logo ? (
        <Image source={logo} style={[styles.img, style]} />
      ) : (
        <Text style={styles.text}>{getBrandLogoText(b)}</Text>
      )}
    </View>
  );
};
