import React, {memo} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {Card as PaperCard} from 'react-native-paper';

export type CardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const Card = memo(function Card({children, style}: CardProps) {
  return (
    <PaperCard mode="elevated" style={style}>
      {children}
    </PaperCard>
  );
});
