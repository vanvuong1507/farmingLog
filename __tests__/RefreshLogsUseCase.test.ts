/**
 * @jest-environment node
 */
import NetInfo from '@react-native-community/netinfo';
import {RefreshLogsUseCase} from '../src/domain/usecases/RefreshLogsUseCase';
import type {LogRepository} from '../src/domain/usecases/LogRepository';
import type {LogsRemoteSource} from '../src/domain/ports/LogsRemoteSource';
import type {Log} from '../src/domain/entities/Log';

jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(),
}));

const sample: Log = {
  id: 'r1',
  activityName: 'R',
  date: '2026-02-02',
  status: 'pending',
  syncStatus: 'synced',
  updatedAt: 5,
  syncRetryCount: 0,
  syncNextAttemptAt: 0,
};

describe('RefreshLogsUseCase', () => {
  const netFetch = NetInfo.fetch as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches, merges, then lists when online', async () => {
    netFetch.mockResolvedValue({isConnected: true});
    const mergeRemoteLogs = jest.fn().mockResolvedValue(undefined);
    const listLogs = jest.fn().mockResolvedValue([sample]);
    const repository = {mergeRemoteLogs, listLogs} as unknown as LogRepository;
    const remote: LogsRemoteSource = {
      fetchLogsList: jest.fn().mockResolvedValue([sample]),
    };
    const uc = new RefreshLogsUseCase(repository, remote);

    const out = await uc.execute();

    expect(remote.fetchLogsList).toHaveBeenCalled();
    expect(mergeRemoteLogs).toHaveBeenCalledWith([sample]);
    expect(listLogs).toHaveBeenCalled();
    expect(out).toEqual([sample]);
  });

  it('skips remote when offline but still lists local', async () => {
    netFetch.mockResolvedValue({isConnected: false});
    const mergeRemoteLogs = jest.fn();
    const listLogs = jest.fn().mockResolvedValue([]);
    const repository = {mergeRemoteLogs, listLogs} as unknown as LogRepository;
    const remote: LogsRemoteSource = {
      fetchLogsList: jest.fn(),
    };
    const out = await new RefreshLogsUseCase(repository, remote).execute();

    expect(remote.fetchLogsList).not.toHaveBeenCalled();
    expect(mergeRemoteLogs).not.toHaveBeenCalled();
    expect(listLogs).toHaveBeenCalled();
    expect(out).toEqual([]);
  });

  it('coalesces concurrent execute into one remote fetch', async () => {
    netFetch.mockResolvedValue({isConnected: true});
    const mergeRemoteLogs = jest.fn().mockResolvedValue(undefined);
    const listLogs = jest.fn().mockResolvedValue([sample]);
    const repository = {mergeRemoteLogs, listLogs} as unknown as LogRepository;

    let resolveFetch!: (v: Log[]) => void;
    const fetchLogsList = jest.fn().mockImplementation(
      () =>
        new Promise<Log[]>(resolve => {
          resolveFetch = resolve;
        }),
    );
    const remote: LogsRemoteSource = {fetchLogsList};
    const uc = new RefreshLogsUseCase(repository, remote);

    const p1 = uc.execute();
    const p2 = uc.execute();
    const p3 = uc.execute();
    await Promise.resolve();
    await Promise.resolve();

    expect(fetchLogsList).toHaveBeenCalledTimes(1);
    resolveFetch!([sample]);
    await expect(Promise.all([p1, p2, p3])).resolves.toEqual([
      [sample],
      [sample],
      [sample],
    ]);
    expect(mergeRemoteLogs).toHaveBeenCalledTimes(1);
    expect(listLogs).toHaveBeenCalledTimes(1);
  });

  it('lists local when fetch throws', async () => {
    netFetch.mockResolvedValue({isConnected: true});
    const mergeRemoteLogs = jest.fn();
    const listLogs = jest.fn().mockResolvedValue([sample]);
    const repository = {mergeRemoteLogs, listLogs} as unknown as LogRepository;
    const remote: LogsRemoteSource = {
      fetchLogsList: jest.fn().mockRejectedValue(new Error('timeout')),
    };
    const out = await new RefreshLogsUseCase(repository, remote).execute();

    expect(mergeRemoteLogs).not.toHaveBeenCalled();
    expect(listLogs).toHaveBeenCalled();
    expect(out).toEqual([sample]);
  });
});
