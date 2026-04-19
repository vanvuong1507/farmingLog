import React, {memo} from 'react';
import {
  Button as PaperButton,
  type ButtonProps as PaperButtonProps,
} from 'react-native-paper';

export type ButtonProps = Omit<PaperButtonProps, 'children'> & {
  title: string;
};

export const Button = memo(function Button({
  title,
  mode = 'contained',
  ...rest
}: ButtonProps) {
  return (
    <PaperButton mode={mode} {...rest}>
      {title}
    </PaperButton>
  );
});
