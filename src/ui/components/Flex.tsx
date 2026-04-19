import {useThemeColor} from '@libs/theme/useThemeColor';
import React, {useMemo, type PropsWithChildren} from 'react';
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  View,
  type DimensionValue,
  type FlexAlignType,
  type ImageSourcePropType,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';
export type FlexJustifyContent =
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';

export interface FlexProps extends Omit<ViewProps, 'style'> {
  direction?: FlexDirection;
  gap?: number;
  alignItems?: FlexAlignType;
  justifyContent?: FlexJustifyContent;
  flex?: number;
  padding?: DimensionValue;
  paddingHorizontal?: DimensionValue;
  paddingVertical?: DimensionValue;
  paddingTop?: DimensionValue;
  paddingBottom?: DimensionValue;
  paddingLeft?: DimensionValue;
  paddingRight?: DimensionValue;
  paddingStart?: DimensionValue;
  paddingEnd?: DimensionValue;
  margin?: DimensionValue;
  marginHorizontal?: DimensionValue;
  marginVertical?: DimensionValue;
  marginTop?: DimensionValue;
  marginBottom?: DimensionValue;
  marginLeft?: DimensionValue;
  marginRight?: DimensionValue;
  marginStart?: DimensionValue;
  marginEnd?: DimensionValue;
  width?: DimensionValue;
  height?: DimensionValue;
  backgroundColor?: string;
  borderRadius?: number;
  borderColor?: string;
  borderWidth?: number;
  backgroundImage?: ImageSourcePropType;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  onLongPress?: () => void;
  safeAreaBottom?: boolean;
  enableTheme?: boolean;
  lightColor?: string;
  darkColor?: string;
  overflow?: 'visible' | 'hidden' | 'scroll';
  position?: ViewStyle['position'];
}

export function Flex({
  children,
  direction = 'column',
  gap = 10,
  alignItems,
  justifyContent,
  flex,
  padding,
  paddingHorizontal,
  paddingVertical,
  paddingTop,
  paddingBottom,
  paddingLeft,
  paddingRight,
  paddingStart,
  paddingEnd,
  margin,
  marginHorizontal,
  marginVertical,
  marginTop,
  marginBottom,
  marginLeft,
  marginRight,
  marginStart,
  marginEnd,
  width,
  height,
  backgroundColor,
  borderRadius,
  borderColor,
  borderWidth,
  backgroundImage,
  resizeMode,
  style,
  onPress,
  onLongPress,
  safeAreaBottom = false,
  enableTheme = false,
  lightColor,
  darkColor,
  overflow,
  position,
  ...restProps
}: PropsWithChildren<FlexProps>) {
  const {bottom: safeAreaBottomInset} = useSafeAreaInsets();

  const themeBackgroundColor = useThemeColor(
    {light: lightColor, dark: darkColor},
    'background',
  );

  const containerStyle = useMemo<ViewStyle>(() => {
    const base: ViewStyle = {
      flexDirection: direction,
      gap,
    };

    if (alignItems) {
      base.alignItems = alignItems;
    }
    if (justifyContent) {
      base.justifyContent = justifyContent;
    }
    if (flex !== undefined) {
      base.flex = flex;
    }

    if (width) {
      base.width = width;
    }
    if (height) {
      base.height = height;
    }
    if (enableTheme) {
      base.backgroundColor = themeBackgroundColor;
    } else if (backgroundColor) {
      base.backgroundColor = backgroundColor;
    }
    if (borderRadius !== undefined) {
      base.borderRadius = borderRadius;
    }

    if (padding !== undefined) {
      base.padding = padding;
    }
    if (paddingHorizontal !== undefined) {
      base.paddingHorizontal = paddingHorizontal;
    }
    if (paddingVertical !== undefined) {
      base.paddingVertical = paddingVertical;
    }
    if (paddingTop !== undefined) {
      base.paddingTop = paddingTop;
    }
    if (paddingBottom !== undefined) {
      base.paddingBottom = paddingBottom;
    }
    if (paddingLeft !== undefined) {
      base.paddingLeft = paddingLeft;
    }
    if (paddingRight !== undefined) {
      base.paddingRight = paddingRight;
    }
    if (paddingStart !== undefined) {
      base.paddingStart = paddingStart;
    }
    if (paddingEnd !== undefined) {
      base.paddingEnd = paddingEnd;
    }

    if (margin !== undefined) {
      base.margin = margin;
    }
    if (marginHorizontal !== undefined) {
      base.marginHorizontal = marginHorizontal;
    }
    if (marginVertical !== undefined) {
      base.marginVertical = marginVertical;
    }
    if (marginTop !== undefined) {
      base.marginTop = marginTop;
    }
    if (marginBottom !== undefined) {
      base.marginBottom = marginBottom;
    }
    if (marginLeft !== undefined) {
      base.marginLeft = marginLeft;
    }
    if (marginRight !== undefined) {
      base.marginRight = marginRight;
    }
    if (marginStart !== undefined) {
      base.marginStart = marginStart;
    }
    if (marginEnd !== undefined) {
      base.marginEnd = marginEnd;
    }
    if (overflow) {
      base.overflow = overflow;
    }
    if (borderColor) {
      base.borderColor = borderColor;
    }
    if (borderWidth !== undefined) {
      base.borderWidth = borderWidth;
    }
    if (position) {
      base.position = position;
    }
    if (safeAreaBottom && safeAreaBottomInset > 0) {
      const currentBottom =
        typeof base.paddingBottom === 'number' ? base.paddingBottom : 0;
      base.paddingBottom = currentBottom + safeAreaBottomInset;
    }

    return base;
  }, [
    direction,
    gap,
    alignItems,
    justifyContent,
    flex,
    width,
    height,
    backgroundColor,
    borderRadius,
    borderColor,
    borderWidth,
    padding,
    paddingHorizontal,
    paddingVertical,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    paddingStart,
    paddingEnd,
    margin,
    marginHorizontal,
    marginVertical,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    marginStart,
    marginEnd,
    safeAreaBottom,
    safeAreaBottomInset,
    enableTheme,
    themeBackgroundColor,
    overflow,
    position,
  ]);

  const Component = onPress || onLongPress ? Pressable : View;
  const pressableProps = onPress || onLongPress ? {onPress, onLongPress} : {};

  if (backgroundImage) {
    return (
      <ImageBackground
        source={backgroundImage}
        style={[containerStyle, style]}
        resizeMode={resizeMode}
        {...restProps}>
        <Component style={styles.flexFill} {...pressableProps}>
          {children}
        </Component>
      </ImageBackground>
    );
  }

  return (
    <Component
      style={[containerStyle, style]}
      {...pressableProps}
      {...restProps}>
      {children}
    </Component>
  );
}

const styles = StyleSheet.create({
  flexFill: {flex: 1},
});

export type {FlexAlignType} from 'react-native';
