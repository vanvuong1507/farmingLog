import React, {memo} from 'react';
import {Button} from '@ui/components/Button';

export type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
};

export const PrimaryButton = memo(function PrimaryButton({
  title,
  onPress,
  disabled = false,
}: PrimaryButtonProps) {
  return (
    <Button
      mode="contained"
      title={title}
      onPress={onPress}
      disabled={disabled}
    />
  );
});
