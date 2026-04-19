import {SyncJobsDao} from '@data/db/SyncJobsDao';
import type {EnqueueSyncJobInput, SyncJobRepository} from '@domain/usecases/SyncJobRepository';
import {logger} from '@libs/logger';

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export class SyncJobRepositoryImpl implements SyncJobRepository {
  constructor(private readonly dao: SyncJobsDao) {}

  supersedePendingLogPushForLogId(logId: string): Promise<void> {
    return this.dao.supersedePendingLogPushForLogId(logId);
  }

  async enqueue(input: EnqueueSyncJobInput): Promise<void> {
    const id = createId();
    const createdAt = Date.now();
    logger.debug('Outbox', `job ${input.type} id=${id} idem=${input.idempotencyKey}`);
    await this.dao.insertJob({
      id,
      type: input.type,
      payloadJson: JSON.stringify(input.payload),
      idempotencyKey: input.idempotencyKey,
      createdAt,
    });
  }

  listRunnable(limit: number, nowMs: number) {
    return this.dao.listRunnable(limit, nowMs);
  }

  markSucceeded(jobId: string) {
    return this.dao.markSucceeded(jobId);
  }

  markFailed(
    jobId: string,
    retryCount: number,
    nextAttemptAt: number,
    lastError: string,
  ) {
    return this.dao.markFailed(jobId, retryCount, nextAttemptAt, lastError);
  }
}
