import type {SyncJob, SyncJobType} from '@domain/entities/SyncJob';

export type EnqueueSyncJobInput = {
  type: SyncJobType;
  /** Object sẽ được JSON.stringify khi ghi DB. */
  payload: unknown;
  idempotencyKey: string;
};

export interface SyncJobRepository {
  /**
   * Đóng các job `log.push` pending/failed trùng `logId` (bản chỉnh sửa mới thay thế).
   * Gọi trước `enqueue` khi upsert log để tránh drain nhiều job cho cùng một bản ghi.
   */
  supersedePendingLogPushForLogId(logId: string): Promise<void>;
  enqueue(input: EnqueueSyncJobInput): Promise<void>;
  listRunnable(limit: number, nowMs: number): Promise<SyncJob[]>;
  markSucceeded(jobId: string): Promise<void>;
  markFailed(
    jobId: string,
    retryCount: number,
    nextAttemptAt: number,
    lastError: string,
  ): Promise<void>;
}
