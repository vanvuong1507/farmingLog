/**
 * @jest-environment node
 */
import {resolveAppearance} from '@ui/theme/resolveAppearance';

describe('resolveAppearance', () => {
  it('returns fixed modes regardless of system', () => {
    expect(resolveAppearance('light', 'dark')).toBe('light');
    expect(resolveAppearance('dark', undefined)).toBe('dark');
  });

  it('maps system from scheme', () => {
    expect(resolveAppearance('system', 'dark')).toBe('dark');
    expect(resolveAppearance('system', 'light')).toBe('light');
    expect(resolveAppearance('system', null)).toBe('light');
    expect(resolveAppearance('system', undefined)).toBe('light');
  });
});
