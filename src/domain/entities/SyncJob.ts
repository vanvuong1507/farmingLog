/** Các loại job outbox — mở rộng bằng cách thêm literal và handler tương ứng. */
export const SYNC_JOB_TYPES = ['log.push'] as const;
export type SyncJobType = (typeof SYNC_JOB_TYPES)[number];

export type SyncJobRowStatus = 'pending' | 'failed' | 'done';

export interface LogPushPayload {
  logId: string;
}

export interface SyncJob {
  id: string;
  type: SyncJobType;
  /** JSON string lưu DB; parse theo `type` trong handler. */
  payloadJson: string;
  idempotencyKey: string;
  status: SyncJobRowStatus;
  retryCount: number;
  nextAttemptAt: number;
  createdAt: number;
  lastError: string | null;
}
