import React, {memo} from 'react';
import {StyleSheet, type StyleProp, type ViewStyle} from 'react-native';
import {Surface} from 'react-native-paper';
import {space} from '@ui/tokens/layout';

export type ScreenProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Mặc định có padding màn hình; tắt khi tự quản lý layout (vd. full-bleed list). */
  padded?: boolean;
};

export const Screen = memo(function Screen({
  children,
  style,
  padded = true,
}: ScreenProps) {
  return (
    <Surface
      elevation={0}
      style={[styles.root, padded ? styles.padded : null, style]}>
      {children}
    </Surface>
  );
});

const styles = StyleSheet.create({
  root: {flex: 1},
  padded: {padding: space.screenPadding},
});
