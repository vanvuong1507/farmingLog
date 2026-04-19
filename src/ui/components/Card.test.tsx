import React from 'react';
import {Text as RNText} from 'react-native';
import {render, screen} from '@testing-library/react-native';
import {Card} from '@ui/components/Card';
import {ThemeProvider} from '@ui/theme';

describe('Card', () => {
  it('renders children', () => {
    render(
      <ThemeProvider>
        <Card>
          <RNText>inside card</RNText>
        </Card>
      </ThemeProvider>,
    );
    expect(screen.getByText('inside card')).toBeTruthy();
  });
});
