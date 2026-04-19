import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {Appearance, type ColorSchemeName} from 'react-native';
import {PaperProvider} from 'react-native-paper';
import {appDarkTheme, appLightTheme} from '@ui/theme/appTheme';
import {
  resolveAppearance,
  type AppThemeMode,
  type ResolvedAppearance,
} from '@ui/theme/resolveAppearance';

const THEME_STORAGE_KEY = '@farming/themeMode';

export type {AppThemeMode, ResolvedAppearance} from '@ui/theme/resolveAppearance';

type ThemeModeContextValue = {
  mode: AppThemeMode;
  /** Theme đang áp dụng (sau khi giải `system`). */
  resolvedAppearance: ResolvedAppearance;
  setMode: (mode: AppThemeMode) => void;
  /** Vòng: system → light → dark → system. */
  cycleThemePreference: () => void;
};

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

/**
 * Lắng nghe thay đổi giao diện hệ thống (ổn định hơn chỉ dùng `useColorScheme` trên một số build).
 */
function useSystemColorScheme(): ColorSchemeName | null {
  const [scheme, setScheme] = useState<ColorSchemeName | null>(() =>
    Appearance.getColorScheme() ?? null,
  );

  React.useEffect(() => {
    const sub = Appearance.addChangeListener(({colorScheme}) => {
      setScheme(colorScheme);
    });
    return () => sub.remove();
  }, []);

  return scheme;
}

export function useThemeMode(): ThemeModeContextValue {
  const ctx = useContext(ThemeModeContext);
  if (ctx == null) {
    throw new Error('useThemeMode must be used within ThemeProvider');
  }
  return ctx;
}

type Props = {
  children: React.ReactNode;
};

export function ThemeProvider({children}: Props) {
  const systemScheme = useSystemColorScheme();
  const [mode, setModeState] = useState<AppThemeMode>('system');

  const resolvedAppearance = useMemo(
    () => resolveAppearance(mode, systemScheme),
    [mode, systemScheme],
  );

  React.useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored === 'dark' || stored === 'light' || stored === 'system') {
          setModeState(stored);
        }
      } catch {
        /* ignore */
      }
    })().catch(() => {
      /* ignore */
    });
  }, []);

  const setMode = useCallback((next: AppThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch(() => {
      /* ignore */
    });
  }, []);

  const cycleThemePreference = useCallback(() => {
    setModeState(prev => {
      const next: AppThemeMode =
        prev === 'system' ? 'light' : prev === 'light' ? 'dark' : 'system';
      AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch(() => {
        /* ignore */
      });
      return next;
    });
  }, []);

  const paperTheme =
    resolvedAppearance === 'dark' ? appDarkTheme : appLightTheme;

  const ctx = useMemo(
    () => ({
      mode,
      resolvedAppearance,
      setMode,
      cycleThemePreference,
    }),
    [mode, resolvedAppearance, setMode, cycleThemePreference],
  );

  return (
    <ThemeModeContext.Provider value={ctx}>
      <PaperProvider theme={paperTheme}>{children}</PaperProvider>
    </ThemeModeContext.Provider>
  );
}
