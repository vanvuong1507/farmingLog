import {useMemo} from 'react';
import type {ComponentProps} from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import {Text as PaperText, useTheme} from 'react-native-paper';

/** Kiểu chữ bổ sung (merge vào style; tương thích với `variant` MD3 của Paper). */
export type TextVariant =
  | 'default'
  | 'medium'
  | 'semiBold'
  | 'bold'
  | 'header'
  | 'bodyLarge'
  | 'bodyMedium'
  | 'bodySmall'
  | 'xHeader';

export type FontWeightType =
  | 'normal'
  | 'bold'
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900';

const TEXT_SIZES = {
  small: 12,
  default: 14,
  large: 16,
  xlarge: 20,
  xxlarge: 24,
} as const;

const variantStyles: Record<
  TextVariant,
  {fontWeight: FontWeightType; fontSize: number; lineHeight: number}
> = {
  default: {
    fontWeight: '400',
    fontSize: TEXT_SIZES.default,
    lineHeight: TEXT_SIZES.default * 1.5,
  },
  medium: {
    fontWeight: '500',
    fontSize: TEXT_SIZES.default,
    lineHeight: TEXT_SIZES.default * 1.5,
  },
  semiBold: {
    fontWeight: '600',
    fontSize: TEXT_SIZES.default,
    lineHeight: TEXT_SIZES.default * 1.5,
  },
  bold: {
    fontWeight: '700',
    fontSize: TEXT_SIZES.default,
    lineHeight: TEXT_SIZES.default * 1.5,
  },
  header: {
    fontWeight: '700',
    fontSize: TEXT_SIZES.xlarge,
    lineHeight: TEXT_SIZES.xlarge * 1.2,
  },
  xHeader: {
    fontWeight: '700',
    fontSize: TEXT_SIZES.xxlarge,
    lineHeight: TEXT_SIZES.xxlarge * 1.2,
  },
  bodyLarge: {
    fontWeight: '400',
    fontSize: TEXT_SIZES.large,
    lineHeight: TEXT_SIZES.large * 1.5,
  },
  bodyMedium: {
    fontWeight: '400',
    fontSize: TEXT_SIZES.default,
    lineHeight: TEXT_SIZES.default * 1.5,
  },
  bodySmall: {
    fontWeight: '400',
    fontSize: TEXT_SIZES.small,
    lineHeight: TEXT_SIZES.small * 1.5,
  },
};

export type TextComponentProps = ComponentProps<typeof PaperText> & {
  typography?: TextVariant;
  marginBottom?: number;
  /** Paper typings không luôn có `color` — hỗ trợ cho API quen thuộc RN. */
  color?: string;
  fontSize?: number;
  fontWeight?: TextStyle['fontWeight'];
};

/**
 * Chữ hiển thị — bọc `Text` của React Native Paper; mặc định màu theo `theme.colors.onSurface`.
 */
export function Text({
  children,
  typography,
  marginBottom = 0,
  style,
  variant,
  color,
  fontSize,
  fontWeight,
  ...rest
}: TextComponentProps) {
  const theme = useTheme();
  const themeText = theme.colors.onSurface;

  const typoStyle = useMemo<StyleProp<TextStyle> | undefined>(() => {
    if (!typography) {
      return undefined;
    }
    const vs = variantStyles[typography] ?? variantStyles.default;
    const fs = fontSize ?? vs.fontSize;
    const lh =
      fontSize != null
        ? fontSize * 1.5
        : typography === 'header' || typography === 'xHeader'
          ? fs * 1.2
          : vs.lineHeight;
    return {
      fontSize: fs,
      fontWeight: (fontWeight ?? vs.fontWeight) as TextStyle['fontWeight'],
      lineHeight: lh,
    };
  }, [typography, fontWeight, fontSize]);

  const mergedColor = color ?? themeText;

  return (
    <PaperText
      variant={variant}
      style={[
        {color: mergedColor, marginBottom},
        typoStyle,
        fontSize != null && typography == null ? {fontSize} : null,
        fontWeight != null && typography == null
          ? {fontWeight: fontWeight as TextStyle['fontWeight']}
          : null,
        style,
      ]}
      {...rest}>
      {children}
    </PaperText>
  );
}
