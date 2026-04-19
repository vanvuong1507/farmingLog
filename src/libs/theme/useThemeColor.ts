import {useTheme} from 'react-native-paper';
import type {SemanticColorName} from '@ui/theme/semanticColors';

/**
 * Màu theo theme Paper hiện tại (`useTheme`) — dùng cho `Flex` (`enableTheme`).
 * @see https://callstack.github.io/react-native-paper/docs/guides/theming/
 */
export function useThemeColor(
  props: {light?: string; dark?: string},
  colorName: SemanticColorName,
): string {
  const theme = useTheme();
  const scheme = theme.dark ? 'dark' : 'light';
  const fromProps = props[scheme];
  if (fromProps) {
    return fromProps;
  }
  if (colorName === 'text') {
    return theme.colors.onSurface;
  }
  return theme.colors.background;
}
