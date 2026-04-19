import type {Log, UpsertLogInput} from '@domain/entities/Log';
import {logSyncIdempotencyKey} from '@domain/entities/Log';
import {shouldApplyRemoteLogMerge} from '@domain/policies/remoteLogMergePolicy';
import type {LogRepository} from '@domain/usecases/LogRepository';
import type {SyncJobRepository} from '@domain/usecases/SyncJobRepository';
import {LogsDao} from '@data/db/LogsDao';
import {logger} from '@libs/logger';

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export class LogsRepositoryImpl implements LogRepository {
  constructor(
    private readonly dao: LogsDao,
    private readonly syncJobs: SyncJobRepository,
  ) {}

  listLogs(): Promise<Log[]> {
    return this.dao.listLogs();
  }

  async mergeRemoteLogs(remoteItems: Log[]): Promise<void> {
    for (const remote of remoteItems) {
      const local = await this.dao.getById(remote.id);
      if (!shouldApplyRemoteLogMerge(local, remote)) {
        continue;
      }
      const merged: Log = {
        ...remote,
        syncRetryCount: remote.syncRetryCount ?? 0,
        syncNextAttemptAt: remote.syncNextAttemptAt ?? 0,
      };
      await this.dao.upsertLog(merged);
    }
  }

  getLog(id: string): Promise<Log | null> {
    return this.dao.getById(id);
  }

  private async enqueueLogPushIfNeeded(log: Log): Promise<void> {
    if (log.syncStatus === 'synced') {
      logger.debug('Outbox', `skip push log=${log.id} (synced)`);
      return;
    }
    logger.debug('Outbox', `enqueue push log=${log.id}`);
    await this.syncJobs.supersedePendingLogPushForLogId(log.id);
    await this.syncJobs.enqueue({
      type: 'log.push',
      payload: {logId: log.id},
      idempotencyKey: logSyncIdempotencyKey(log),
    });
  }

  async addLog(input: UpsertLogInput): Promise<Log> {
    const log: Log = {
      id: input.id ?? createId(),
      activityName: input.activityName,
      date: input.date,
      notes: input.notes,
      status: input.status,
      syncStatus: 'pending',
      updatedAt: Date.now(),
      syncRetryCount: 0,
      syncNextAttemptAt: 0,
    };
    await this.dao.upsertLog(log);
    await this.enqueueLogPushIfNeeded(log);
    return log;
  }

  async editLog(id: string, input: UpsertLogInput): Promise<Log> {
    const current = await this.dao.getById(id);
    const next: Log = {
      id,
      activityName: input.activityName,
      date: input.date,
      notes: input.notes,
      status: input.status,
      syncStatus:
        current?.syncStatus === 'synced'
          ? 'pending'
          : current?.syncStatus ?? 'pending',
      updatedAt: Date.now(),
      syncRetryCount: 0,
      syncNextAttemptAt: 0,
    };
    await this.dao.upsertLog(next);
    await this.enqueueLogPushIfNeeded(next);
    return next;
  }

  markLogSynced(id: string): Promise<void> {
    return this.dao.markLogSynced(id);
  }

  markLogSyncFailed(
    id: string,
    retryCount: number,
    nextAttemptAt: number,
  ): Promise<void> {
    return this.dao.markLogSyncFailed(id, retryCount, nextAttemptAt);
  }
}
