/**
 * @jest-environment node
 */
import type {SyncJob} from '../src/domain/entities/SyncJob';
import {createDefaultSyncJobRunner} from '../src/services/sync/outboxSyncJobRunner';
import type {OutboxSyncRunnerDeps} from '../src/services/sync/outboxSyncJobRunner';

const minimalDeps = (): OutboxSyncRunnerDeps => ({
  logRepository: {} as OutboxSyncRunnerDeps['logRepository'],
  syncJobRepository: {} as OutboxSyncRunnerDeps['syncJobRepository'],
  apis: {logsApi: {} as OutboxSyncRunnerDeps['apis']['logsApi']},
});

describe('createDefaultSyncJobRunner', () => {
  const runner = createDefaultSyncJobRunner();

  it('throws on unknown job type', async () => {
    const job = {
      id: 'j',
      type: 'noop',
      payloadJson: '{}',
      idempotencyKey: 'k',
      status: 'pending',
      retryCount: 0,
      nextAttemptAt: 0,
      createdAt: 1,
      lastError: null,
    } as unknown as SyncJob;

    await expect(runner(job, minimalDeps())).rejects.toThrow(
      /Unhandled sync job type/,
    );
  });
});
