import React from 'react';
import {render, screen} from '@testing-library/react-native';
import {Text} from '@ui/components/Text';
import {ThemeProvider} from '@ui/theme';

describe('Text', () => {
  it('renders children with typography variant', () => {
    render(
      <ThemeProvider>
        <Text typography="bodySmall">visible copy</Text>
      </ThemeProvider>,
    );
    expect(screen.getByText('visible copy')).toBeTruthy();
  });

  it('renders header typography', () => {
    render(
      <ThemeProvider>
        <Text typography="header">Title line</Text>
      </ThemeProvider>,
    );
    expect(screen.getByText('Title line')).toBeTruthy();
  });
});
