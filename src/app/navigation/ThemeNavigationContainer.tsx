import React, {useMemo} from 'react';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import {useTheme} from 'react-native-paper';

type Props = {
  children: React.ReactNode;
};

/**
 * Đồng bộ màu navigation với theme Paper (light/dark).
 * @see https://callstack.github.io/react-native-paper/docs/guides/theming/
 */
export function ThemeNavigationContainer({children}: Props) {
  const paper = useTheme();

  const navigationTheme = useMemo(
    () => ({
      ...(paper.dark ? DarkTheme : DefaultTheme),
      colors: {
        ...(paper.dark ? DarkTheme.colors : DefaultTheme.colors),
        primary: paper.colors.primary,
        background: paper.colors.background,
        card: paper.colors.surface,
        text: paper.colors.onSurface,
        border: paper.colors.outline,
        notification: paper.colors.error,
      },
    }),
    [paper],
  );

  return (
    <NavigationContainer theme={navigationTheme}>
      {children}
    </NavigationContainer>
  );
}
