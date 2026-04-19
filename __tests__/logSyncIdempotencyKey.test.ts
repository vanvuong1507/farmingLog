/**
 * @jest-environment node
 */
import {logSyncIdempotencyKey} from '../src/domain/entities/Log';
import type {Log} from '../src/domain/entities/Log';

const log = (overrides: Partial<Log> = {}): Log => ({
  id: 'a1',
  activityName: 'X',
  date: '2026-01-01',
  status: 'pending',
  syncStatus: 'pending',
  updatedAt: 555,
  syncRetryCount: 0,
  syncNextAttemptAt: 0,
  ...overrides,
});

describe('logSyncIdempotencyKey', () => {
  it('combines id and updatedAt', () => {
    expect(logSyncIdempotencyKey(log())).toBe('a1:555');
  });

  it('changes when updatedAt changes', () => {
    expect(logSyncIdempotencyKey(log({updatedAt: 556}))).toBe('a1:556');
  });
});
