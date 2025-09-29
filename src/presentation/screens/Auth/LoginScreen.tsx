import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Animated, Alert } from "react-native";
import { Button } from "@components/Button";
import { useAuth } from "@store/authStore";
import { useFadeSlideInOnFocus } from "@presentation/hooks/animations";
import AppConfig from "@config/appConfig";
import { useTheme } from "@presentation/theme/theme";
import { makeLoginStyles } from "./LoginScreen.styles";
import { useI18n } from "@presentation/i18n/I18nProvider";
import { BrandLogo } from "@components/BrandLogo";
import { AuthScreenProps } from "@presentation/navigation/types";

export const LoginScreen: React.FC<AuthScreenProps<"Login">> = ({
  navigation,
}) => {
  const { signIn } = useAuth();
  const [providerLoading, setProviderLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { animatedStyle } = useFadeSlideInOnFocus();
  const { t } = useI18n();
  const theme = useTheme();
  const styles = useMemo(() => makeLoginStyles(theme), [theme]);

  const handleGoogleSignInError = (error: any) => {
    console.error("Google Sign-In Error:", error);

    // Handle specific error cases
    let errorMessage = t("auth.googleLoginFailed");

    if (error?.code === "SIGN_IN_CANCELLED") {
      errorMessage = t("auth.loginCancelled");
    } else if (error?.code === "IN_PROGRESS") {
      // Another sign-in is in progress, handle if needed
      console.log("Sign in already in progress");
      return;
    } else if (error?.code === "PLAY_SERVICES_NOT_AVAILABLE") {
      errorMessage = t("auth.playServicesMissing");
    } else if (error?.code === "SIGN_IN_REQUIRED") {
      errorMessage = t("auth.signInRequired");
    } else if (error?.message) {
      // Handle other Firebase/Google Sign-In specific errors
      if (error.message.includes("network error")) {
        errorMessage = t("common.networkError");
      } else if (error.message.includes("invalid token")) {
        errorMessage = t("auth.invalidToken");
      } else if (error.message.includes("Firebase config is missing")) {
        errorMessage = t("auth.firebaseNotConfigured");
      } else if (error.message.includes("Client ID não configurado")) {
        errorMessage = t("auth.notConfiguredFirebase");
      }
    }

    setError(errorMessage);
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      setProviderLoading(true);
      await signIn("google");
      console.log("Success on Google Sign-In");
      // The RootNavigator will handle the navigation based on auth state
      // No need to navigate manually here
    } catch (error: Error | any) {
      handleGoogleSignInError(error);
    } finally {
      setProviderLoading(false);
    }
  };

  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => {
        Alert.alert(t("common.errorTitle"), error || t("common.unknownError"));
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [error]);

  return (
    <Animated.View style={[styles.container, animatedStyle as any]}>
      <BrandLogo />
      <Text style={styles.title}>{t("auth.welcome")}</Text>
      <Text style={styles.subtitle}>{t("auth.continue")}</Text>

      <View style={styles.spacerMd} />
      <Button
        title={t("auth.google")}
        loading={providerLoading}
        disabled={providerLoading}
        onPress={async () => handleGoogleSignIn()}
      />
      <View style={styles.spacerSm} />
      {AppConfig.useMock && (
        <Text style={styles.hint}>{t("auth.mockHint")}</Text>
      )}
    </Animated.View>
  );
};

/** styles moved to LoginScreen.styles.ts */
