/**
 * @jest-environment node
 */
import {runSaga} from 'redux-saga';
import {logActions} from '../src/features/logs/store/logSlice';
import {
  addLogWorker,
  editLogWorker,
  loadLogsWorker,
  syncWorker,
} from '../src/features/logs/sagas/logSaga';

const mockListExecute = jest.fn();
const mockAddExecute = jest.fn();
const mockEditExecute = jest.fn();
const mockSyncRun = jest.fn();

jest.mock('../src/app/store/dependencies', () => ({
  dependencies: {
    refreshLogsUseCase: {
      execute: (...args: unknown[]) => mockListExecute(...args),
    },
    addLogUseCase: {execute: (...args: unknown[]) => mockAddExecute(...args)},
    editLogUseCase: {execute: (...args: unknown[]) => mockEditExecute(...args)},
    syncEngine: {run: (...args: unknown[]) => mockSyncRun(...args)},
  },
}));

describe('logSaga workers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loadLogsWorker dispatches success', async () => {
    const rows = [
      {
        id: 'a',
        activityName: 'Till',
        date: '2026-04-01',
        status: 'pending' as const,
        syncStatus: 'synced' as const,
        updatedAt: 1,
        syncRetryCount: 0,
        syncNextAttemptAt: 0,
      },
    ];
    mockListExecute.mockResolvedValue(rows);
    const dispatched: unknown[] = [];

    await runSaga(
      {
        dispatch: (a: unknown) => dispatched.push(a),
        getState: () => ({}),
      },
      loadLogsWorker,
    ).toPromise();

    expect(mockListExecute).toHaveBeenCalled();
    expect(dispatched).toContainEqual(logActions.loadLogsSuccess(rows));
  });

  it('addLogWorker dispatches persist failure on error', async () => {
    mockAddExecute.mockRejectedValue(new Error('disk full'));
    const dispatched: unknown[] = [];

    await runSaga(
      {
        dispatch: (a: unknown) => dispatched.push(a),
        getState: () => ({}),
      },
      addLogWorker,
      logActions.addLogRequest({
        activityName: 'X',
        date: '2026-01-02',
        status: 'pending',
      }),
    ).toPromise();

    expect(dispatched).toContainEqual(logActions.persistLogFailure('disk full'));
    expect(
      dispatched.some(
        a =>
          typeof a === 'object' &&
          a !== null &&
          'type' in a &&
          (a as {type: string}).type === logActions.loadLogsRequest.type,
      ),
    ).toBe(false);
  });

  it('loadLogsWorker dispatches failure when use case throws', async () => {
    mockListExecute.mockRejectedValue(new Error('timeout'));
    const dispatched: unknown[] = [];

    await runSaga(
      {
        dispatch: (a: unknown) => dispatched.push(a),
        getState: () => ({}),
      },
      loadLogsWorker,
    ).toPromise();

    expect(dispatched).toContainEqual(logActions.loadLogsFailure('timeout'));
  });

  it('addLogWorker on success chains persist, reload, sync', async () => {
    mockAddExecute.mockResolvedValue(undefined);
    const dispatched: unknown[] = [];

    await runSaga(
      {
        dispatch: (a: unknown) => dispatched.push(a),
        getState: () => ({}),
      },
      addLogWorker,
      logActions.addLogRequest({
        activityName: 'Y',
        date: '2026-02-02',
        status: 'completed',
      }),
    ).toPromise();

    expect(dispatched.map((a: {type?: string}) => a?.type)).toEqual([
      logActions.persistLogSuccess.type,
      logActions.loadLogsRequest.type,
      logActions.triggerSync.type,
    ]);
  });

  it('editLogWorker dispatches persist failure on error', async () => {
    mockEditExecute.mockRejectedValue(new Error('locked'));
    const dispatched: unknown[] = [];

    await runSaga(
      {
        dispatch: (a: unknown) => dispatched.push(a),
        getState: () => ({}),
      },
      editLogWorker,
      logActions.editLogRequest({
        id: 'id-1',
        input: {
          activityName: 'Z',
          date: '2026-03-03',
          status: 'pending',
        },
      }),
    ).toPromise();

    expect(dispatched).toContainEqual(logActions.persistLogFailure('locked'));
  });

  it('syncWorker reloads list when processed > 0', async () => {
    mockSyncRun.mockResolvedValue(3);
    const dispatched: unknown[] = [];

    await runSaga(
      {
        dispatch: (a: unknown) => dispatched.push(a),
        getState: () => ({}),
      },
      syncWorker,
    ).toPromise();

    expect(mockSyncRun).toHaveBeenCalledWith(10);
    expect(dispatched).toContainEqual(logActions.loadLogsRequest());
    expect(dispatched).toContainEqual(logActions.syncDone());
  });

  it('syncWorker skips reload when nothing processed', async () => {
    mockSyncRun.mockResolvedValue(0);
    const dispatched: unknown[] = [];

    await runSaga(
      {
        dispatch: (a: unknown) => dispatched.push(a),
        getState: () => ({}),
      },
      syncWorker,
    ).toPromise();

    expect(
      dispatched.filter(
        a =>
          typeof a === 'object' &&
          a !== null &&
          'type' in a &&
          (a as {type: string}).type === logActions.loadLogsRequest.type,
      ),
    ).toHaveLength(0);
    expect(dispatched).toContainEqual(logActions.syncDone());
  });

  it('syncWorker always emits syncDone even when run throws', async () => {
    mockSyncRun.mockRejectedValue(new Error('net'));
    const dispatched: unknown[] = [];
    const err = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(
      runSaga(
        {
          dispatch: (a: unknown) => dispatched.push(a),
          getState: () => ({}),
        },
        syncWorker,
      ).toPromise(),
    ).rejects.toThrow('net');

    expect(dispatched).toContainEqual(logActions.syncDone());
    err.mockRestore();
  });
});
