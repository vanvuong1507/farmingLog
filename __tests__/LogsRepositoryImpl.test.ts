/**
 * @jest-environment node
 */
import {LogsRepositoryImpl} from '../src/data/repository/LogsRepositoryImpl';
import type {LogsDao} from '../src/data/db/LogsDao';
import type {SyncJobRepository} from '../src/domain/usecases/SyncJobRepository';

const makeDao = (): jest.Mocked<Pick<LogsDao, 'upsertLog' | 'getById'>> => ({
  upsertLog: jest.fn().mockResolvedValue(undefined),
  getById: jest.fn().mockResolvedValue(null),
});

const remoteRow = {
  id: 'remote-1',
  activityName: 'From API',
  date: '2026-05-01',
  status: 'completed' as const,
  syncStatus: 'synced' as const,
  updatedAt: 5000,
  syncRetryCount: 0,
  syncNextAttemptAt: 0,
};

const makeSyncJobs = (): jest.Mocked<
  Pick<SyncJobRepository, 'enqueue' | 'supersedePendingLogPushForLogId'>
> => ({
  supersedePendingLogPushForLogId: jest.fn().mockResolvedValue(undefined),
  enqueue: jest.fn().mockResolvedValue(undefined),
});

describe('LogsRepositoryImpl', () => {
  it('addLog assigns id and pending sync', async () => {
    const dao = makeDao();
    const syncJobs = makeSyncJobs();
    const repo = new LogsRepositoryImpl(
      dao as unknown as LogsDao,
      syncJobs as unknown as SyncJobRepository,
    );

    const saved = await repo.addLog({
      activityName: 'Irrigate',
      date: '2026-04-10',
      status: 'pending',
    });

    expect(saved.activityName).toBe('Irrigate');
    expect(saved.syncStatus).toBe('pending');
    expect(saved.id.length).toBeGreaterThan(4);
    expect(dao.upsertLog).toHaveBeenCalledWith(
      expect.objectContaining({
        activityName: 'Irrigate',
        syncStatus: 'pending',
        syncRetryCount: 0,
        syncNextAttemptAt: 0,
      }),
    );
    expect(syncJobs.supersedePendingLogPushForLogId).toHaveBeenCalledWith(
      saved.id,
    );
    expect(syncJobs.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'log.push',
        payload: {logId: saved.id},
      }),
    );
  });

  it('editLog twice calls supersede before each enqueue for same log id', async () => {
    const dao = makeDao();
    dao.getById.mockResolvedValue({
      id: 'log-x',
      activityName: 'A',
      date: '2026-01-01',
      status: 'pending',
      syncStatus: 'pending',
      updatedAt: 1,
      syncRetryCount: 0,
      syncNextAttemptAt: 0,
    });
    const syncJobs = makeSyncJobs();
    const repo = new LogsRepositoryImpl(
      dao as unknown as LogsDao,
      syncJobs as unknown as SyncJobRepository,
    );

    await repo.editLog('log-x', {
      activityName: 'B',
      date: '2026-01-02',
      status: 'pending',
    });
    await repo.editLog('log-x', {
      activityName: 'C',
      date: '2026-01-03',
      status: 'completed',
    });

    expect(syncJobs.supersedePendingLogPushForLogId).toHaveBeenCalledTimes(2);
    expect(syncJobs.supersedePendingLogPushForLogId).toHaveBeenNthCalledWith(
      1,
      'log-x',
    );
    expect(syncJobs.supersedePendingLogPushForLogId).toHaveBeenNthCalledWith(
      2,
      'log-x',
    );
    expect(syncJobs.enqueue).toHaveBeenCalledTimes(2);
  });

  it('mergeRemoteLogs upserts when no local row', async () => {
    const dao = makeDao();
    const syncJobs = makeSyncJobs();
    const repo = new LogsRepositoryImpl(
      dao as unknown as LogsDao,
      syncJobs as unknown as SyncJobRepository,
    );

    await repo.mergeRemoteLogs([remoteRow]);

    expect(dao.getById).toHaveBeenCalledWith('remote-1');
    expect(dao.upsertLog).toHaveBeenCalledWith(
      expect.objectContaining({id: 'remote-1', activityName: 'From API'}),
    );
    expect(syncJobs.enqueue).not.toHaveBeenCalled();
  });

  it('mergeRemoteLogs skips when local pending is newer', async () => {
    const dao = makeDao();
    dao.getById.mockResolvedValue({
      ...remoteRow,
      updatedAt: 9999,
      syncStatus: 'pending',
      activityName: 'Local edit',
    });
    const syncJobs = makeSyncJobs();
    const repo = new LogsRepositoryImpl(
      dao as unknown as LogsDao,
      syncJobs as unknown as SyncJobRepository,
    );

    await repo.mergeRemoteLogs([remoteRow]);

    expect(dao.upsertLog).not.toHaveBeenCalled();
  });

  it('addLog persists notes and still enqueues push', async () => {
    const dao = makeDao();
    const syncJobs = makeSyncJobs();
    const repo = new LogsRepositoryImpl(
      dao as unknown as LogsDao,
      syncJobs as unknown as SyncJobRepository,
    );

    const saved = await repo.addLog({
      activityName: 'T',
      date: '2026-04-11',
      notes: '  wet field  ',
      status: 'pending',
    });

    expect(saved.notes).toBe('  wet field  ');
    expect(dao.upsertLog).toHaveBeenCalledWith(
      expect.objectContaining({notes: '  wet field  '}),
    );
    expect(syncJobs.enqueue).toHaveBeenCalled();
  });

  it('editLog after synced forces syncStatus back to pending', async () => {
    const dao = makeDao();
    dao.getById.mockResolvedValue({
      id: 'synced-1',
      activityName: 'Old',
      date: '2026-01-01',
      status: 'completed',
      syncStatus: 'synced',
      updatedAt: 1,
      syncRetryCount: 0,
      syncNextAttemptAt: 0,
    });
    const syncJobs = makeSyncJobs();
    const repo = new LogsRepositoryImpl(
      dao as unknown as LogsDao,
      syncJobs as unknown as SyncJobRepository,
    );

    const next = await repo.editLog('synced-1', {
      activityName: 'New',
      date: '2026-02-02',
      status: 'completed',
    });

    expect(next.syncStatus).toBe('pending');
    expect(syncJobs.enqueue).toHaveBeenCalled();
  });

  it('mergeRemoteLogs upserts when remote is strictly newer than local', async () => {
    const dao = makeDao();
    dao.getById.mockResolvedValue({
      ...remoteRow,
      updatedAt: 100,
      activityName: 'Stale local',
      syncStatus: 'synced',
    });
    const syncJobs = makeSyncJobs();
    const repo = new LogsRepositoryImpl(
      dao as unknown as LogsDao,
      syncJobs as unknown as SyncJobRepository,
    );

    await repo.mergeRemoteLogs([remoteRow]);

    expect(dao.upsertLog).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'remote-1',
        updatedAt: 5000,
        activityName: 'From API',
      }),
    );
  });
});
