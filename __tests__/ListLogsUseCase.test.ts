/**
 * @jest-environment node
 */
import {ListLogsUseCase} from '../src/domain/usecases/ListLogsUseCase';
import type {LogRepository} from '../src/domain/usecases/LogRepository';

describe('ListLogsUseCase', () => {
  it('delegates to repository.listLogs', async () => {
    const rows = [
      {
        id: '1',
        activityName: 'A',
        date: '2026-01-01',
        status: 'pending' as const,
        syncStatus: 'synced' as const,
        updatedAt: 1,
        syncRetryCount: 0,
        syncNextAttemptAt: 0,
      },
    ];
    const listLogs = jest.fn().mockResolvedValue(rows);
    const repository = {listLogs} as unknown as LogRepository;
    const uc = new ListLogsUseCase(repository);

    const out = await uc.execute();

    expect(listLogs).toHaveBeenCalledTimes(1);
    expect(listLogs).toHaveBeenCalledWith();
    expect(out).toBe(rows);
  });
});
