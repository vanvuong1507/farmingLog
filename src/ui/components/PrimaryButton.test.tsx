import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react-native';
import {PrimaryButton} from '@ui/components/PrimaryButton';
import {ThemeProvider} from '@ui/theme';

describe('PrimaryButton', () => {
  it('fires onPress when pressed', () => {
    const onPress = jest.fn();
    render(
      <ThemeProvider>
        <PrimaryButton title="Save log" onPress={onPress} />
      </ThemeProvider>,
    );

    fireEvent.press(screen.getByText('Save log'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    render(
      <ThemeProvider>
        <PrimaryButton title="Busy" onPress={onPress} disabled />
      </ThemeProvider>,
    );

    fireEvent.press(screen.getByText('Busy'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
