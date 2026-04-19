/**
 * @jest-environment node
 */
import {shouldApplyRemoteLogMerge} from '../src/domain/policies/remoteLogMergePolicy';
import type {Log} from '../src/domain/entities/Log';

const base = (overrides: Partial<Log> = {}): Log => ({
  id: '1',
  activityName: 'A',
  date: '2026-01-01',
  status: 'pending',
  syncStatus: 'pending',
  updatedAt: 100,
  syncRetryCount: 0,
  syncNextAttemptAt: 0,
  ...overrides,
});

describe('shouldApplyRemoteLogMerge', () => {
  it('applies when no local row', () => {
    expect(shouldApplyRemoteLogMerge(null, base({updatedAt: 1}))).toBe(true);
  });

  it('applies when remote is strictly newer', () => {
    expect(
      shouldApplyRemoteLogMerge(base({updatedAt: 10}), base({updatedAt: 20})),
    ).toBe(true);
  });

  it('skips when remote is older', () => {
    expect(
      shouldApplyRemoteLogMerge(base({updatedAt: 30}), base({updatedAt: 20})),
    ).toBe(false);
  });

  it('same timestamp: keeps local pending', () => {
    expect(
      shouldApplyRemoteLogMerge(
        base({updatedAt: 50, syncStatus: 'pending'}),
        base({updatedAt: 50, activityName: 'Remote'}),
      ),
    ).toBe(false);
  });

  it('same timestamp: applies when local not pending', () => {
    expect(
      shouldApplyRemoteLogMerge(
        base({updatedAt: 50, syncStatus: 'synced'}),
        base({updatedAt: 50, activityName: 'Remote'}),
      ),
    ).toBe(true);
  });
});
