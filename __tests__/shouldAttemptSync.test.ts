/**
 * @jest-environment node
 */
import {shouldAttemptSync} from '../src/libs/network/shouldAttemptSync';
import type {NetInfoState} from '@react-native-community/netinfo';

const state = (partial: Partial<NetInfoState>): NetInfoState =>
  ({
    type: 'wifi',
    isConnected: false,
    isInternetReachable: null,
    ...partial,
  }) as NetInfoState;

describe('shouldAttemptSync', () => {
  it('returns true when connected even if reachability is false', () => {
    expect(
      shouldAttemptSync(
        state({isConnected: true, isInternetReachable: false}),
      ),
    ).toBe(true);
  });

  it('returns false when not connected', () => {
    expect(
      shouldAttemptSync(
        state({isConnected: false, isInternetReachable: true}),
      ),
    ).toBe(false);
  });

  it('returns false when isConnected is null (unknown)', () => {
    expect(shouldAttemptSync(state({isConnected: null}))).toBe(false);
  });
});
