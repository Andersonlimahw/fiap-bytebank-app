import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Platform, NativeModules } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { pt } from "./locales/pt";
import { en } from "./locales/en";
import { es } from "./locales/es";

type Lang = "pt" | "en" | "es";
type Dict = typeof es;

const dictionaries: Record<Lang, Dict> = { pt, en, es };

type I18nContextValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (path: string) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function get(obj: any, path: string): any {
  return path
    .split(".")
    .reduce(
      (acc, key) => (acc && acc[key] != null ? acc[key] : undefined),
      obj
    );
}

export const I18nProvider: React.FC<{
  initialLang?: Lang;
  children: React.ReactNode;
}> = ({ initialLang = "pt", children }) => {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const dict = dictionaries[lang] || dictionaries.pt;

  // Persist language and auto-detect from device on first mount
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem("i18n.lang");
        if (saved === "pt" || saved === "en" || saved === "es") {
          setLangState(saved as Lang);
          return;
        }
      } catch {}
      const device = getDeviceLocale();
      const best = mapLocaleToLang(device);
      setLangState(best);
    })();
  }, []);

  const setLang = async (l: Lang) => {
    setLangState(l);
    try {
      await AsyncStorage.setItem("i18n.lang", l);
    } catch {}
  };

  const value = useMemo<I18nContextValue>(
    () => ({ lang, setLang, t: (path: string) => get(dict, path) ?? path }),
    [lang, dict]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

// Helpers
function getDeviceLocale(): string {
  try {
    if (Platform.OS === "ios") {
      const settings = (NativeModules as any)?.SettingsManager?.settings;
      const locale =
        settings?.AppleLocale ||
        (settings?.AppleLanguages && settings?.AppleLanguages[0]);
      if (typeof locale === "string") return locale;
    } else {
      const locale = (NativeModules as any)?.I18nManager?.localeIdentifier;
      if (typeof locale === "string") return locale;
    }
  } catch {}
  return "en-US";
}

function mapLocaleToLang(locale: string): Lang {
  const lc = (locale || "").toLowerCase();
  if (lc.startsWith("pt")) return "pt";
  if (lc.startsWith("es")) return "es";
  return "en";
}
