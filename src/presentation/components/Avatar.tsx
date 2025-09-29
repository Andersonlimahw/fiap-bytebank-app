import React, { useMemo } from "react";
import {
  Image,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ImageSourcePropType,
} from "react-native";
import { useTheme } from "@presentation/theme/theme";
import { useI18n } from "@presentation/i18n/I18nProvider";

type AvatarProps = {
  username?: string;
  source?: ImageSourcePropType;
  size?: number;
  showName?: boolean;
  onPress?: () => void;
  style?: any;
};

export const Avatar: React.FC<AvatarProps> = ({
  username,
  source = require("../../../public/assets/images/icons/Avatar.png"),
  size = 40,
  showName = false,
  onPress,
  style,
}) => {
  const theme = useTheme();
  const { t } = useI18n();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flexDirection: "row", alignItems: "center" },
        avatar: {
          backgroundColor: theme.colors.surface,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.colors.border,
        },
        username: {
          marginLeft: 8,
          fontSize: 16,
          fontWeight: "600",
          color: theme.colors.text,
          fontFamily: theme.fonts.medium,
        },
      }),
    [theme]
  );
  const Container = onPress ? TouchableOpacity : View;
  return (
    <Container
      onPress={onPress}
      accessibilityRole={onPress ? "button" : undefined}
      style={[styles.container, style]}
    >
      <Image
        source={source}
        style={[
          styles.avatar,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      />
      {showName ? (
        <Text style={styles.username} numberOfLines={1}>
          {username || t("user.userFallback")}
        </Text>
      ) : null}
    </Container>
  );
};
