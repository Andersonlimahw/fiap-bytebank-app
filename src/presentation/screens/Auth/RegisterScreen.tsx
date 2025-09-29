import React, { useMemo, useState } from "react";
import { View, Text, Image, TouchableOpacity, Animated } from "react-native";
import { Button } from "@components/Button";
import { Input } from "@components/Input";
import { useAuth } from "@store/authStore";
import { useFadeSlideInOnFocus } from "../../hooks/animations";
import { useTheme } from "@presentation/theme/theme";
import { useI18n } from "@presentation/i18n/I18nProvider";
import { makeRegisterStyles } from "./RegisterScreen.styles";

export const RegisterScreen: React.FC<any> = ({ navigation }) => {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { animatedStyle } = useFadeSlideInOnFocus();
  const theme = useTheme();
  const styles = useMemo(() => makeRegisterStyles(theme), [theme]);
  const { t } = useI18n();

  const handleRegister = async () => {
    setError(null);
    if (!email || !password) {
      setError(t("auth.fillEmailPassword"));
      return;
    }
    if (password.length < 6) {
      setError(t("auth.passwordMin"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("auth.passwordMismatch"));
      return;
    }
    setLoading(true);
    try {
      await signUp({ email, password });
      // After sign up, user is considered authenticated by repo; stack will switch automatically.
    } catch (e: any) {
      setError(e?.message ?? t("auth.registerFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.View style={[styles.container, animatedStyle as any]}>
      <Image
        source={require("../../../../public/assets/images/banners/register.png")}
        style={styles.illustration}
      />
      <Text style={styles.title}>{t("auth.noAccount")}</Text>
      <Text style={styles.subtitle}> </Text>

      <Input
        placeholder={t("auth.email")}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        accessibilityLabel={t("auth.email")}
      />
      <Input
        placeholder={t("auth.password")}
        secureTextEntry
        showPasswordToggle
        value={password}
        onChangeText={setPassword}
        accessibilityLabel={t("auth.password")}
      />
      <Input
        placeholder={t("auth.confirmPassword")}
        secureTextEntry
        showPasswordToggle
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        accessibilityLabel={t("auth.confirmPassword")}
        errorText={error}
      />

      <Button
        title={loading ? t("common.loading") : t("auth.createAccount")}
        onPress={handleRegister}
      />

      <TouchableOpacity onPress={() => navigation?.goBack?.()}>
        <Text style={styles.link}>{t("auth.signInWithEmail")}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// styles moved to RegisterScreen.styles.ts
