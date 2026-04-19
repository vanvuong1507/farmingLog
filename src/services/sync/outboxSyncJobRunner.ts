import type {SyncJob} from '@domain/entities/SyncJob';
import type {LogsApi} from '@data/api/logs/LogsApi';
import type {LogRepository} from '@domain/usecases/LogRepository';
import type {SyncJobRepository} from '@domain/usecases/SyncJobRepository';
import {logger} from '@libs/logger';
import {handleLogPushJob} from '@services/sync/logPushJobHandler';

export type OutboxSyncRunnerDeps = {
  logRepository: LogRepository;
  syncJobRepository: SyncJobRepository;
  apis: {logsApi: LogsApi};
};

export type SyncJobRunner = (
  job: SyncJob,
  deps: OutboxSyncRunnerDeps,
) => Promise<void>;

export function createDefaultSyncJobRunner(): SyncJobRunner {
  return async (job, deps) => {
    logger.debug('OutboxRunner', `${job.type} job=${job.id}`);
    switch (job.type) {
      case 'log.push':
        await handleLogPushJob(job, {
          logRepository: deps.logRepository,
          syncJobRepository: deps.syncJobRepository,
          logsApi: deps.apis.logsApi,
        });
        return;
      default:
        throw new Error(
          `Unhandled sync job type: ${String((job as {type: string}).type)}`,
        );
    }
  };
}
