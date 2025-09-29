// White-label dynamic theme
// Facade: re-export theme types and hooks for presentation layer
export type {
  AppTheme,
  ThemeMode,
  ThemeColors,
  BrandId,
} from "@store/themeStore";
export { useTheme, useThemeActions } from "@store/themeStore";
export { getNavigationTheme } from "@store/themeStore";
export { getAvailableBrands } from "@store/themeStore";
