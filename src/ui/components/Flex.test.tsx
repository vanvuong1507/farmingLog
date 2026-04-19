import React from 'react';
import {Text as RNText} from 'react-native';
import {fireEvent, render, screen} from '@testing-library/react-native';
import {Flex} from '@ui/components/Flex';
import {ThemeProvider} from '@ui/theme';

describe('Flex', () => {
  it('renders children in column by default', () => {
    render(
      <ThemeProvider>
        <Flex>
          <RNText>child-a</RNText>
        </Flex>
      </ThemeProvider>,
    );
    expect(screen.getByText('child-a')).toBeTruthy();
  });

  it('uses Pressable when onPress is set', () => {
    const onPress = jest.fn();
    render(
      <ThemeProvider>
        <Flex onPress={onPress}>
          <RNText>tap-me</RNText>
        </Flex>
      </ThemeProvider>,
    );
    fireEvent.press(screen.getByText('tap-me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders row direction with multiple children', () => {
    render(
      <ThemeProvider>
        <Flex direction="row" gap={4}>
          <RNText>left</RNText>
          <RNText>right</RNText>
        </Flex>
      </ThemeProvider>,
    );
    expect(screen.getByText('left')).toBeTruthy();
    expect(screen.getByText('right')).toBeTruthy();
  });
});
