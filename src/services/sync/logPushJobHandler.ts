import {logSyncIdempotencyKey} from '@domain/entities/Log';
import type {LogPushPayload, SyncJob} from '@domain/entities/SyncJob';
import type {LogsApi} from '@data/api/logs/LogsApi';
import type {LogRepository} from '@domain/usecases/LogRepository';
import type {SyncJobRepository} from '@domain/usecases/SyncJobRepository';
import {logger} from '@libs/logger';
import {computeSyncBackoffMs} from '@services/sync/syncBackoff';

export type LogPushJobHandlerCtx = {
  logRepository: LogRepository;
  syncJobRepository: SyncJobRepository;
  logsApi: LogsApi;
};

function parseLogPushPayload(raw: string): LogPushPayload | null {
  try {
    const o = JSON.parse(raw) as unknown;
    if (
      o &&
      typeof o === 'object' &&
      'logId' in o &&
      typeof (o as LogPushPayload).logId === 'string'
    ) {
      return o as LogPushPayload;
    }
  } catch {
    /* invalid JSON */
  }
  return null;
}

/** `log.push`: đọc log → `LogsApi.syncLog` → cập nhật DB + job (hoặc đóng job nếu không cần gửi). */
export async function handleLogPushJob(
  job: SyncJob,
  ctx: LogPushJobHandlerCtx,
): Promise<void> {
  const dbg = (msg: string) => logger.debug('OutboxJob', msg);

  dbg(`push start job=${job.id} idem=${job.idempotencyKey}`);

  const payload = parseLogPushPayload(job.payloadJson);
  if (!payload) {
    dbg(`push job=${job.id} close invalid payload`);
    await ctx.syncJobRepository.markSucceeded(job.id);
    return;
  }

  const log = await ctx.logRepository.getLog(payload.logId);
  if (!log) {
    dbg(`push job=${job.id} log=${payload.logId} close missing row`);
    await ctx.syncJobRepository.markSucceeded(job.id);
    return;
  }

  if (log.syncStatus === 'synced') {
    dbg(`push job=${job.id} log=${log.id} close already synced`);
    await ctx.syncJobRepository.markSucceeded(job.id);
    return;
  }

  if (job.idempotencyKey !== logSyncIdempotencyKey(log)) {
    dbg(`push job=${job.id} log=${log.id} close stale idempotency`);
    await ctx.syncJobRepository.markSucceeded(job.id);
    return;
  }

  dbg(`push PUT log=${log.id} job=${job.id} try=${job.retryCount + 1}`);

  try {
    await ctx.logsApi.syncLog(log);
    await ctx.logRepository.markLogSynced(log.id);
    await ctx.syncJobRepository.markSucceeded(job.id);
    dbg(`push OK log=${log.id} job=${job.id}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const nextRetry = job.retryCount + 1;
    const nextAttemptAt = Date.now() + computeSyncBackoffMs(nextRetry);
    dbg(
      `push FAIL log=${log.id} job=${job.id} retry=${nextRetry} at=${nextAttemptAt}: ${message}`,
    );
    await ctx.logRepository.markLogSyncFailed(log.id, nextRetry, nextAttemptAt);
    await ctx.syncJobRepository.markFailed(
      job.id,
      nextRetry,
      nextAttemptAt,
      message,
    );
  }
}
