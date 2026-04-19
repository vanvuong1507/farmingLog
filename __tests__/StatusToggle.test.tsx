import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react-native';
import {StatusToggle} from '../src/features/logs/components/StatusToggle';
import {ThemeProvider} from '../src/ui/theme';

describe('StatusToggle', () => {
  it('invokes onChange when selecting the other status', () => {
    const onChange = jest.fn();
    render(
      <ThemeProvider>
        <StatusToggle value="pending" onChange={onChange} />
      </ThemeProvider>,
    );

    fireEvent.press(screen.getByText('completed'));
    expect(onChange).toHaveBeenCalledWith('completed');
  });
});
