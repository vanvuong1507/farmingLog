import {MD3DarkTheme, MD3LightTheme, type MD3Theme} from 'react-native-paper';
import {colors} from '@ui/tokens/colors';

const brand = {
  primary: colors.primary,
  onPrimary: colors.onPrimary,
  primaryContainer: colors.primaryMuted,
  error: colors.error,
  onError: colors.onPrimary,
} as const;

/** Theme sáng — theo [Paper Theming](https://callstack.github.io/react-native-paper/docs/guides/theming/). */
export const appLightTheme: MD3Theme = {
  ...MD3LightTheme,
  dark: false,
  colors: {
    ...MD3LightTheme.colors,
    ...brand,
    onPrimaryContainer: colors.text,
    onSurface: colors.text,
    onSurfaceVariant: colors.textMuted,
    surface: colors.surface,
    surfaceVariant: colors.primaryMuted,
    background: colors.surface,
    onBackground: colors.text,
    outline: colors.border,
    surfaceDisabled: colors.border,
    onSurfaceDisabled: colors.textMuted,
  },
};

/** Theme tối — `MD3DarkTheme` + cùng brand colors. */
export const appDarkTheme: MD3Theme = {
  ...MD3DarkTheme,
  dark: true,
  colors: {
    ...MD3DarkTheme.colors,
    ...brand,
    onPrimaryContainer: '#e6edf3',
    onSurface: '#e6edf3',
    onSurfaceVariant: '#8b949e',
    surface: '#161b22',
    surfaceVariant: '#21262d',
    background: '#0d1117',
    onBackground: '#e6edf3',
    outline: '#30363d',
    surfaceDisabled: '#30363d',
    onSurfaceDisabled: '#6e7681',
  },
};

/** @deprecated Dùng `appLightTheme`. */
export const appTheme = appLightTheme;
