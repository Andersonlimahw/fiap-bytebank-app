import {
  NavigationProp,
  CommonActions,
  RouteProp,
} from "@react-navigation/native";

type RootStackParamList = {
  Login: undefined;
  Back: undefined;
  // Add other screen names and their params here
  [key: string]: object | undefined;
};

type NavigationType = NavigationProp<RootStackParamList> & {
  reset?: (state: any) => void;
  navigate: (name: keyof RootStackParamList, params?: any) => void;
};

/**
 * Resets the navigation stack to a specific route
 * Works with both Stack and Tab navigators, with proper fallbacks
 * @param navigation - The navigation prop from React Navigation
 * @param routeName - The name of the route to navigate to
 * @param params - Optional parameters to pass to the route
 */
export function resetToRoute(
  navigation: NavigationType,
  routeName: keyof RootStackParamList,
  params?: Record<string, unknown>
): void {
  try {
    // Try to use reset if available
    if (navigation.reset) {
      navigation.reset({
        index: 0,
        routes: [{ name: routeName as string, params }],
      });
      return;
    }
  } catch (error) {
    console.warn("Navigation reset failed, falling back to navigate", error);
  }

  // Fallback to navigate if reset is not available or fails
  try {
    navigation.navigate(routeName, params);
  } catch (error) {
    console.error("Navigation failed:", error);
  }
}

/**
 * Navigates to the Login screen and resets the navigation stack
 * @param navigation - The navigation prop from React Navigation
 */
export function goToLogin(navigation: NavigationType): void {
  resetToRoute(navigation, "Login");
}

/**
 * Navigates to the main app screen (Back screen with tabs)
 * Uses a simple navigation to avoid conflicts with auth state changes
 * @param navigation - The navigation prop from React Navigation
 */
export function goToHome(navigation: NavigationType): void {
  try {
    navigation.navigate("Back");
  } catch (error) {
    console.error("Failed to navigate to home:", error);
  }
}

/**
 * Navigates to the main app screen (Back screen with tabs)
 * Uses a simple navigation to avoid conflicts with auth state changes
 * @param navigation - The navigation prop from React Navigation
 */
export function backScreen(navigation: NavigationType): void {
  try {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      goToHome(navigation);
    }
  } catch (error) {
    console.error("Failed to navigate to home:", error);
  }
}
