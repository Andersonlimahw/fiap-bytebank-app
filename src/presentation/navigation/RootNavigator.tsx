import React, { useMemo } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuth } from "@store/authStore";
import { LoginScreen } from "../screens/Auth/LoginScreen";
import { OnboardingScreen } from "../screens/Onboarding/OnboardingScreen";
import { HomeScreen } from "../screens/Home/HomeScreen";
import { DashboardScreen } from "../screens/Dashboard/DashboardScreen";
import { InvestmentsScreen } from "../screens/Investments/InvestmentsScreen";
import { ExtractScreen } from "../screens/Extract/ExtractScreen";
import { ActivityIndicator, Text } from "react-native";
import { rootNavigatorStyles as styles } from "./RootNavigator.styles";
import { UserScreen } from "../screens/User/UserScreen";
import { useI18n } from "../i18n/I18nProvider";
import { useTheme } from "../theme/theme";

type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
};

type AppTabParamList = {
  Home: undefined;
  Dashboard: undefined;
  Investments: undefined;
  Extract: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<AppTabParamList>();
const AppStack = createNativeStackNavigator();

import { MaterialIcons } from "@expo/vector-icons";

function AppTabs() {
  const theme = useTheme();
  const { t } = useI18n();
  const commonTabOptions = useMemo(
    () => ({
      headerStyle: { backgroundColor: theme.colors.surface },
      headerTintColor: theme.colors.text,
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.muted,
      tabBarStyle: {
        backgroundColor: theme.colors.surface,
        borderTopColor: theme.colors.border,
      },
      tabBarHideOnKeyboard: true,
    }),
    [theme]
  );
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...commonTabOptions,
        tabBarIcon: ({ color, size }) => {
          let iconName: React.ComponentProps<typeof MaterialIcons>["name"] =
            "help";
          if (route.name === "Home") iconName = "home";
          else if (route.name === "Dashboard") iconName = "dashboard";
          else if (route.name === "Investments") iconName = "trending-up";
          else if (route.name === "Extract") iconName = "receipt";
          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: t("tabs.home"), headerTitle: t("titles.home") }}
      />
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: t("tabs.dashboard"),
          headerTitle: t("titles.dashboard"),
        }}
      />
      <Tab.Screen
        name="Investments"
        component={InvestmentsScreen}
        options={{
          tabBarLabel: t("tabs.investments"),
          headerTitle: t("titles.investments"),
        }}
      />
      <Tab.Screen
        name="Extract"
        component={ExtractScreen}
        options={{
          tabBarLabel: t("tabs.extract"),
          headerTitle: t("titles.extract"),
        }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { user, loading, isAuthenticated, isHydrated } = useAuth();
  const { t } = useI18n();
  const theme = useTheme();

  if (loading || user === undefined || !isHydrated) {
    return (
      <Text style={[styles.loading, { color: theme.colors.text }]}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </Text>
    );
  }

  if (!user || !isAuthenticated) {
    return (
      <AuthStack.Navigator
        key={"auth"}
        initialRouteName="Onboarding"
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          animationTypeForReplace: "push",
          fullScreenGestureEnabled: true,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <AuthStack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{
            // Onboarding entra com fade para dar sensação de leveza
            animation: "fade",
          }}
        />
        <AuthStack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            // Login mantém push padrão lateral
            animation: "slide_from_right",
          }}
        />
        <AuthStack.Screen
          name="Register"
          component={require("../screens/Auth/RegisterScreen").RegisterScreen}
          options={{
            // Registro sobe de baixo para cima (modal-like)
            animation: "slide_from_bottom",
          }}
        />
      </AuthStack.Navigator>
    );
  }

  return (
    <AppStack.Navigator
      key={"app"}
      initialRouteName="App"
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <AppStack.Screen
        name="App"
        component={AppTabs}
        options={{ title: t("common.appName"), headerShown: false }}
      />
      <AppStack.Screen
        name="User"
        component={UserScreen}
        options={{ title: t("titles.myAccount") }}
      />
      <AppStack.Screen
        name="Pix"
        component={require("../screens/Pix/PixScreen").PixScreen}
        options={{ title: t("titles.pix") }}
      />
      <AppStack.Screen
        name="DigitalCards"
        component={
          require("../screens/Cards/DigitalCardsScreen").DigitalCardsScreen
        }
        options={{ title: t("titles.digitalCards") }}
      />
      <AppStack.Screen
        name="AddTransaction"
        component={
          require("../screens/Transactions/AddTransactionScreen")
            .AddTransactionScreen
        }
        options={{
          presentation: "modal",
          title: t("titles.newTransaction"),
        }}
      />
    </AppStack.Navigator>
  );
}
