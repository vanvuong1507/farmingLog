import React, {memo} from 'react';
import {
  TextInput as PaperTextInput,
  type TextInputProps,
} from 'react-native-paper';

export type TextFieldProps = TextInputProps;

export const TextField = memo(function TextField({
  mode = 'outlined',
  ...rest
}: TextFieldProps) {
  return <PaperTextInput mode={mode} {...rest} />;
});
