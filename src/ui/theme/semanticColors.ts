import {colors} from '@ui/tokens/colors';

/**
 * Bảng màu theo scheme (clone ý tưởng oka-test `Colors` + dùng token farming).
 */
export const semanticColors = {
  light: {
    text: colors.text,
    background: colors.surface,
  },
  dark: {
    text: '#e6edf3',
    background: '#0d1117',
  },
} as const;

export type SemanticColorScheme = keyof typeof semanticColors;

export type SemanticColorName = keyof (typeof semanticColors)['light'];
