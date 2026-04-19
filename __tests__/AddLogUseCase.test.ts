/**
 * @jest-environment node
 */
import {AddLogUseCase} from '../src/domain/usecases/AddLogUseCase';
import type {LogRepository} from '../src/domain/usecases/LogRepository';

describe('AddLogUseCase', () => {
  it('delegates to repository.addLog with same input', async () => {
    const saved = {
      id: 'new-1',
      activityName: 'Seed',
      date: '2026-01-01',
      status: 'pending' as const,
      syncStatus: 'pending' as const,
      updatedAt: 1,
      syncRetryCount: 0,
      syncNextAttemptAt: 0,
    };
    const addLog = jest.fn().mockResolvedValue(saved);
    const repository = {addLog} as unknown as LogRepository;
    const uc = new AddLogUseCase(repository);

    const input = {
      activityName: 'Seed',
      date: '2026-01-01',
      status: 'pending' as const,
      notes: 'note',
    };
    const out = await uc.execute(input);

    expect(addLog).toHaveBeenCalledTimes(1);
    expect(addLog).toHaveBeenCalledWith(input);
    expect(out).toBe(saved);
  });
});
