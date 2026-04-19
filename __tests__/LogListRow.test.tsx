import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react-native';
import {LogListRow} from '../src/features/logs/components/LogListRow';
import {ThemeProvider} from '../src/ui/theme';

describe('LogListRow', () => {
  it('renders activity, date, status and calls onPress with log id', () => {
    const onPress = jest.fn();
    render(
      <ThemeProvider>
        <LogListRow
          logId="log-42"
          activityName="Fertilizing"
          date="2026-04-10"
          status="completed"
          syncStatus="synced"
          onPress={onPress}
        />
      </ThemeProvider>,
    );

    expect(screen.getByText('Fertilizing')).toBeTruthy();
    expect(screen.getByText('2026-04-10')).toBeTruthy();
    expect(screen.getByText('completed')).toBeTruthy();
    expect(screen.getByText('synced')).toBeTruthy();

    fireEvent.press(screen.getByText('Fertilizing'));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledWith('log-42');
  });
});
