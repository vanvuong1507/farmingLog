import React from 'react';
import {render, screen} from '@testing-library/react-native';
import {SyncStatusBadge} from '../src/features/logs/components/SyncStatusBadge';
import {ThemeProvider} from '../src/ui/theme';

describe('SyncStatusBadge', () => {
  it.each([
    ['pending', 'pending'],
    ['synced', 'synced'],
    ['failed', 'failed'],
  ] as const)('renders %s label', (syncStatus, label) => {
    render(
      <ThemeProvider>
        <SyncStatusBadge syncStatus={syncStatus} />
      </ThemeProvider>,
    );
    expect(screen.getByText(label)).toBeTruthy();
  });
});
