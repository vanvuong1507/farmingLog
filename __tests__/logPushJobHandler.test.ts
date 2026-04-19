/**
 * @jest-environment node
 */
import type {Log} from '../src/domain/entities/Log';
import {logSyncIdempotencyKey} from '../src/domain/entities/Log';
import type {SyncJob} from '../src/domain/entities/SyncJob';
import {handleLogPushJob} from '../src/services/sync/logPushJobHandler';
import {computeSyncBackoffMs} from '../src/services/sync/syncBackoff';

const baseLog = (overrides: Partial<Log> = {}): Log => ({
  id: 'log-1',
  activityName: 'A',
  date: '2026-01-01',
  status: 'pending',
  syncStatus: 'pending',
  updatedAt: 100,
  syncRetryCount: 0,
  syncNextAttemptAt: 0,
  ...overrides,
});

const makeJob = (
  payloadJson: string,
  overrides: Partial<SyncJob> = {},
): SyncJob => ({
  id: 'job-1',
  type: 'log.push',
  payloadJson,
  idempotencyKey: 'any',
  status: 'pending',
  retryCount: 0,
  nextAttemptAt: 0,
  createdAt: 1,
  lastError: null,
  ...overrides,
});

describe('handleLogPushJob', () => {
  const makeCtx = () => ({
    logRepository: {
      getLog: jest.fn(),
      markLogSynced: jest.fn().mockResolvedValue(undefined),
      markLogSyncFailed: jest.fn().mockResolvedValue(undefined),
    },
    syncJobRepository: {
      markSucceeded: jest.fn().mockResolvedValue(undefined),
      markFailed: jest.fn().mockResolvedValue(undefined),
    },
    logsApi: {
      syncLog: jest.fn().mockResolvedValue(undefined),
    },
  });

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-06-01T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('marks job succeeded when payload is invalid JSON', async () => {
    const ctx = makeCtx();
    await handleLogPushJob(makeJob('{'), ctx);
    expect(ctx.syncJobRepository.markSucceeded).toHaveBeenCalledWith('job-1');
    expect(ctx.logRepository.getLog).not.toHaveBeenCalled();
  });

  it('marks job succeeded when payload is not an object with string logId', async () => {
    const ctx = makeCtx();
    await handleLogPushJob(makeJob('"x"'), ctx);
    expect(ctx.syncJobRepository.markSucceeded).toHaveBeenCalledWith('job-1');
  });

  it('marks job succeeded when payload JSON is an array', async () => {
    const ctx = makeCtx();
    await handleLogPushJob(makeJob('[]'), ctx);
    expect(ctx.syncJobRepository.markSucceeded).toHaveBeenCalledWith('job-1');
  });

  it('marks job succeeded when logId is missing', async () => {
    const ctx = makeCtx();
    await handleLogPushJob(makeJob('{}'), ctx);
    expect(ctx.syncJobRepository.markSucceeded).toHaveBeenCalledWith('job-1');
  });

  it('marks job succeeded when log row is missing', async () => {
    const ctx = makeCtx();
    (ctx.logRepository.getLog as jest.Mock).mockResolvedValue(null);
    await handleLogPushJob(makeJob(JSON.stringify({logId: 'missing'})), ctx);
    expect(ctx.logRepository.getLog).toHaveBeenCalledWith('missing');
    expect(ctx.syncJobRepository.markSucceeded).toHaveBeenCalledWith('job-1');
    expect(ctx.logsApi.syncLog).not.toHaveBeenCalled();
  });

  it('marks job succeeded when log already synced (no-op push)', async () => {
    const ctx = makeCtx();
    (ctx.logRepository.getLog as jest.Mock).mockResolvedValue(
      baseLog({syncStatus: 'synced'}),
    );
    await handleLogPushJob(
      makeJob(JSON.stringify({logId: 'log-1'}), {
        idempotencyKey: logSyncIdempotencyKey(baseLog({syncStatus: 'synced'})),
      }),
      ctx,
    );
    expect(ctx.syncJobRepository.markSucceeded).toHaveBeenCalledWith('job-1');
    expect(ctx.logsApi.syncLog).not.toHaveBeenCalled();
  });

  it('marks job succeeded when idempotency key is stale vs current log', async () => {
    const log = baseLog({updatedAt: 200});
    const ctx = makeCtx();
    (ctx.logRepository.getLog as jest.Mock).mockResolvedValue(log);
    await handleLogPushJob(
      makeJob(JSON.stringify({logId: 'log-1'}), {
        idempotencyKey: logSyncIdempotencyKey(baseLog({updatedAt: 100})),
      }),
      ctx,
    );
    expect(ctx.syncJobRepository.markSucceeded).toHaveBeenCalledWith('job-1');
    expect(ctx.logsApi.syncLog).not.toHaveBeenCalled();
  });

  it('on API success marks log synced and job succeeded', async () => {
    const log = baseLog();
    const ctx = makeCtx();
    (ctx.logRepository.getLog as jest.Mock).mockResolvedValue(log);
    await handleLogPushJob(
      makeJob(JSON.stringify({logId: 'log-1'}), {
        idempotencyKey: logSyncIdempotencyKey(log),
      }),
      ctx,
    );
    expect(ctx.logsApi.syncLog).toHaveBeenCalledWith(log);
    expect(ctx.logRepository.markLogSynced).toHaveBeenCalledWith('log-1');
    expect(ctx.syncJobRepository.markSucceeded).toHaveBeenCalledWith('job-1');
    expect(ctx.syncJobRepository.markFailed).not.toHaveBeenCalled();
  });

  it('on API failure increments retry with backoff delay on log and job', async () => {
    const log = baseLog();
    const ctx = makeCtx();
    (ctx.logRepository.getLog as jest.Mock).mockResolvedValue(log);
    (ctx.logsApi.syncLog as jest.Mock).mockRejectedValue(new Error('HTTP 503'));
    const job = makeJob(JSON.stringify({logId: 'log-1'}), {
      idempotencyKey: logSyncIdempotencyKey(log),
      retryCount: 2,
    });

    await handleLogPushJob(job, ctx);

    const expectedNext = Date.now() + computeSyncBackoffMs(3);
    expect(ctx.logRepository.markLogSynced).not.toHaveBeenCalled();
    expect(ctx.logRepository.markLogSyncFailed).toHaveBeenCalledWith(
      'log-1',
      3,
      expectedNext,
    );
    expect(ctx.syncJobRepository.markFailed).toHaveBeenCalledWith(
      'job-1',
      3,
      expectedNext,
      'HTTP 503',
    );
  });

  it('stringifies non-Error rejection for markFailed message', async () => {
    const log = baseLog();
    const ctx = makeCtx();
    (ctx.logRepository.getLog as jest.Mock).mockResolvedValue(log);
    (ctx.logsApi.syncLog as jest.Mock).mockRejectedValue('plain');
    await handleLogPushJob(
      makeJob(JSON.stringify({logId: 'log-1'}), {
        idempotencyKey: logSyncIdempotencyKey(log),
      }),
      ctx,
    );
    expect(ctx.syncJobRepository.markFailed).toHaveBeenCalledWith(
      'job-1',
      1,
      expect.any(Number),
      'plain',
    );
  });
});
