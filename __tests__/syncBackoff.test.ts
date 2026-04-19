/**
 * @jest-environment node
 */
import {computeSyncBackoffMs} from '../src/services/sync/syncBackoff';

describe('computeSyncBackoffMs', () => {
  it('doubles each retry with a ceiling', () => {
    expect(computeSyncBackoffMs(0)).toBe(1000);
    expect(computeSyncBackoffMs(1)).toBe(2000);
    expect(computeSyncBackoffMs(2)).toBe(4000);
    expect(computeSyncBackoffMs(10)).toBe(30_000);
  });
});
