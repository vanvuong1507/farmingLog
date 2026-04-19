import React, {memo} from 'react';
import {
  Divider as PaperDivider,
  type DividerProps as PaperDividerProps,
} from 'react-native-paper';

export type DividerProps = PaperDividerProps;

export const Divider = memo(function Divider(props: DividerProps) {
  return <PaperDivider {...props} />;
});
