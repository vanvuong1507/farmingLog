/**
 * @jest-environment node
 */
import {EditLogUseCase} from '../src/domain/usecases/EditLogUseCase';
import type {LogRepository} from '../src/domain/usecases/LogRepository';

describe('EditLogUseCase', () => {
  it('delegates to repository.editLog with id and input', async () => {
    const updated = {
      id: 'log-9',
      activityName: 'Harvest',
      date: '2026-02-02',
      status: 'completed' as const,
      syncStatus: 'pending' as const,
      updatedAt: 2,
      syncRetryCount: 0,
      syncNextAttemptAt: 0,
    };
    const editLog = jest.fn().mockResolvedValue(updated);
    const repository = {editLog} as unknown as LogRepository;
    const uc = new EditLogUseCase(repository);

    const input = {
      activityName: 'Harvest',
      date: '2026-02-02',
      status: 'completed' as const,
    };
    const out = await uc.execute('log-9', input);

    expect(editLog).toHaveBeenCalledTimes(1);
    expect(editLog).toHaveBeenCalledWith('log-9', input);
    expect(out).toBe(updated);
  });
});
