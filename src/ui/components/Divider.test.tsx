import React from 'react';
import {render} from '@testing-library/react-native';
import {Divider} from '@ui/components/Divider';
import {ThemeProvider} from '@ui/theme';

describe('Divider', () => {
  it('mounts without throwing', () => {
    const {toJSON} = render(
      <ThemeProvider>
        <Divider />
      </ThemeProvider>,
    );
    expect(toJSON()).toBeTruthy();
  });
});
