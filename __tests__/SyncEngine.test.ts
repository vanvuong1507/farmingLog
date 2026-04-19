/**
 * @jest-environment node
 */
import {OutboxSyncEngine} from '../src/services/sync/OutboxSyncEngine';
import type {LogRepository} from '../src/domain/usecases/LogRepository';
import type {SyncJobRepository} from '../src/domain/usecases/SyncJobRepository';
import type {LogsApi} from '../src/data/api/logs/LogsApi';
import type {SyncJob} from '../src/domain/entities/SyncJob';
import {logSyncIdempotencyKey} from '../src/domain/entities/Log';

const mockNetInfoFetch = jest.fn(() =>
  Promise.resolve({isConnected: true, isInternetReachable: true}),
);

jest.mock('@react-native-community/netinfo', () => ({
  fetch: (...args: unknown[]) => mockNetInfoFetch(...args),
}));

const sampleLog = {
  id: 'log-1',
  activityName: 'Harvest',
  date: '2026-04-12',
  status: 'completed' as const,
  syncStatus: 'pending' as const,
  updatedAt: 10,
  syncRetryCount: 0,
  syncNextAttemptAt: 0,
};

const makeJob = (overrides: Partial<SyncJob> = {}): SyncJob => ({
  id: 'job-1',
  type: 'log.push',
  payloadJson: JSON.stringify({logId: sampleLog.id}),
  idempotencyKey: logSyncIdempotencyKey(sampleLog),
  status: 'pending',
  retryCount: 0,
  nextAttemptAt: 0,
  createdAt: 1,
  lastError: null,
  ...overrides,
});

describe('OutboxSyncEngine', () => {
  beforeEach(() => {
    mockNetInfoFetch.mockImplementation(() =>
      Promise.resolve({isConnected: true, isInternetReachable: true}),
    );
  });

  it('returns 0 immediately when offline (no listRunnable)', async () => {
    mockNetInfoFetch.mockResolvedValue({isConnected: false});
    const listRunnable = jest.fn();
    const engine = OutboxSyncEngine.create({
      logRepository: {getLog: jest.fn()} as unknown as LogRepository,
      syncJobRepository: {
        listRunnable,
        markSucceeded: jest.fn(),
        markFailed: jest.fn(),
      } as unknown as SyncJobRepository,
      apis: {logsApi: {syncLog: jest.fn()} as LogsApi},
    });
    expect(await engine.run(5)).toBe(0);
    expect(listRunnable).not.toHaveBeenCalled();
  });

  it('stops drain mid-loop when connection drops before next batch', async () => {
    let fetchCalls = 0;
    mockNetInfoFetch.mockImplementation(() => {
      fetchCalls += 1;
      // 1: entry check, 2: round-1 loop — phải online; 3: round-2 — mất mạng → dừng drain
      if (fetchCalls < 3) {
        return Promise.resolve({isConnected: true});
      }
      return Promise.resolve({isConnected: false});
    });
    const logA = {...sampleLog, id: 'a'};
    const jobA = makeJob({
      id: 'ja',
      payloadJson: JSON.stringify({logId: 'a'}),
      idempotencyKey: logSyncIdempotencyKey(logA),
    });
    const syncJobRepository: Pick<
      SyncJobRepository,
      'listRunnable' | 'markSucceeded' | 'markFailed'
    > = {
      listRunnable: jest
        .fn()
        .mockResolvedValueOnce([jobA])
        .mockResolvedValue([]),
      markSucceeded: jest.fn().mockResolvedValue(undefined),
      markFailed: jest.fn().mockResolvedValue(undefined),
    };
    const repository: Pick<
      LogRepository,
      'getLog' | 'markLogSynced' | 'markLogSyncFailed'
    > = {
      getLog: jest.fn().mockResolvedValue(logA),
      markLogSynced: jest.fn().mockResolvedValue(undefined),
      markLogSyncFailed: jest.fn().mockResolvedValue(undefined),
    };
    const logsApi: Pick<LogsApi, 'syncLog'> = {
      syncLog: jest.fn().mockResolvedValue(undefined),
    };
    const engine = OutboxSyncEngine.create({
      logRepository: repository as LogRepository,
      syncJobRepository: syncJobRepository as SyncJobRepository,
      apis: {logsApi: logsApi as LogsApi},
    });
    expect(await engine.run(5)).toBe(1);
    expect(logsApi.syncLog).toHaveBeenCalledTimes(1);
  });

  it('marks log + job after API succeeds', async () => {
    const syncJobRepository: Pick<
      SyncJobRepository,
      | 'listRunnable'
      | 'markSucceeded'
      | 'markFailed'
      | 'supersedePendingLogPushForLogId'
    > = {
      supersedePendingLogPushForLogId: jest.fn().mockResolvedValue(undefined),
      listRunnable: jest
        .fn()
        .mockResolvedValueOnce([makeJob()])
        .mockResolvedValue([]),
      markSucceeded: jest.fn().mockResolvedValue(undefined),
      markFailed: jest.fn().mockResolvedValue(undefined),
    };
    const repository: Pick<
      LogRepository,
      'getLog' | 'markLogSynced' | 'markLogSyncFailed'
    > = {
      getLog: jest.fn().mockResolvedValue(sampleLog),
      markLogSynced: jest.fn().mockResolvedValue(undefined),
      markLogSyncFailed: jest.fn().mockResolvedValue(undefined),
    };
    const logsApi: Pick<LogsApi, 'syncLog'> = {
      syncLog: jest.fn().mockResolvedValue(undefined),
    };

    const engine = OutboxSyncEngine.create({
      logRepository: repository as LogRepository,
      syncJobRepository: syncJobRepository as SyncJobRepository,
      apis: {logsApi: logsApi as LogsApi},
    });
    expect(await engine.run(5)).toBe(1);

    expect(logsApi.syncLog).toHaveBeenCalledWith(sampleLog);
    expect(repository.markLogSynced).toHaveBeenCalledWith('log-1');
    expect(syncJobRepository.markSucceeded).toHaveBeenCalledWith('job-1');
    expect(syncJobRepository.markFailed).not.toHaveBeenCalled();
  });

  it('drains multiple rounds until no runnable jobs', async () => {
    const logA = {...sampleLog, id: 'a', updatedAt: 15};
    const logB = {...sampleLog, id: 'b', updatedAt: 20};
    const jobA = makeJob({
      id: 'ja',
      payloadJson: JSON.stringify({logId: 'a'}),
      idempotencyKey: logSyncIdempotencyKey(logA),
    });
    const jobB = makeJob({
      id: 'jb',
      payloadJson: JSON.stringify({logId: 'b'}),
      idempotencyKey: logSyncIdempotencyKey(logB),
    });
    const syncJobRepository: Pick<
      SyncJobRepository,
      'listRunnable' | 'markSucceeded' | 'markFailed'
    > = {
      listRunnable: jest
        .fn()
        .mockResolvedValueOnce([jobA])
        .mockResolvedValueOnce([jobB])
        .mockResolvedValue([]),
      markSucceeded: jest.fn().mockResolvedValue(undefined),
      markFailed: jest.fn().mockResolvedValue(undefined),
    };
    const repository: Pick<
      LogRepository,
      'getLog' | 'markLogSynced' | 'markLogSyncFailed'
    > = {
      getLog: jest
        .fn()
        .mockImplementation((id: string) =>
          Promise.resolve(id === 'a' ? logA : logB),
        ),
      markLogSynced: jest.fn().mockResolvedValue(undefined),
      markLogSyncFailed: jest.fn().mockResolvedValue(undefined),
    };
    const logsApi: Pick<LogsApi, 'syncLog'> = {
      syncLog: jest.fn().mockResolvedValue(undefined),
    };

    const engine = OutboxSyncEngine.create({
      logRepository: repository as LogRepository,
      syncJobRepository: syncJobRepository as SyncJobRepository,
      apis: {logsApi: logsApi as LogsApi},
    });
    expect(await engine.run(1)).toBe(2);

    expect(logsApi.syncLog).toHaveBeenCalledTimes(2);
    expect(repository.markLogSynced).toHaveBeenCalledTimes(2);
  });

  it('on API failure persists retry on log + job', async () => {
    const markFailed = jest.fn().mockResolvedValue(undefined);
    const syncJobRepository: Pick<
      SyncJobRepository,
      'listRunnable' | 'markSucceeded' | 'markFailed'
    > = {
      listRunnable: jest
        .fn()
        .mockResolvedValueOnce([makeJob()])
        .mockResolvedValue([]),
      markSucceeded: jest.fn().mockResolvedValue(undefined),
      markFailed,
    };
    const markLogSyncFailed = jest.fn().mockResolvedValue(undefined);
    const repository: Pick<
      LogRepository,
      'getLog' | 'markLogSynced' | 'markLogSyncFailed'
    > = {
      getLog: jest.fn().mockResolvedValue(sampleLog),
      markLogSynced: jest.fn().mockResolvedValue(undefined),
      markLogSyncFailed,
    };
    const logsApi: Pick<LogsApi, 'syncLog'> = {
      syncLog: jest.fn().mockRejectedValue(new Error('boom')),
    };

    const engine = OutboxSyncEngine.create({
      logRepository: repository as LogRepository,
      syncJobRepository: syncJobRepository as SyncJobRepository,
      apis: {logsApi: logsApi as LogsApi},
    });
    expect(await engine.run(5)).toBe(1);

    expect(repository.markLogSynced).not.toHaveBeenCalled();
    expect(markLogSyncFailed).toHaveBeenCalledWith(
      'log-1',
      1,
      expect.any(Number),
    );
    expect(markFailed).toHaveBeenCalledWith(
      'job-1',
      1,
      expect.any(Number),
      'boom',
    );
    const [, retry, nextAt] = markLogSyncFailed.mock.calls[0];
    expect(retry).toBe(1);
    expect(nextAt).toBeGreaterThan(Date.now());
  });

  it('returns 0 when there are no runnable jobs', async () => {
    const syncJobRepository: Pick<
      SyncJobRepository,
      'listRunnable' | 'markSucceeded' | 'markFailed'
    > = {
      listRunnable: jest.fn().mockResolvedValue([]),
      markSucceeded: jest.fn(),
      markFailed: jest.fn(),
    };
    const repository: Pick<LogRepository, 'getLog'> = {
      getLog: jest.fn(),
    };
    const logsApi: Pick<LogsApi, 'syncLog'> = {syncLog: jest.fn()};

    const engine = OutboxSyncEngine.create({
      logRepository: repository as LogRepository,
      syncJobRepository: syncJobRepository as SyncJobRepository,
      apis: {logsApi: logsApi as LogsApi},
    });

    expect(await engine.run(5)).toBe(0);
    expect(logsApi.syncLog).not.toHaveBeenCalled();
  });
});
