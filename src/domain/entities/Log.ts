export type LogStatus = 'pending' | 'completed';

export type SyncStatus = 'pending' | 'synced' | 'failed';

export interface Log {
  id: string;
  activityName: string;
  date: string;
  notes?: string;
  status: LogStatus;
  syncStatus: SyncStatus;
  updatedAt: number;
  /** Số lần sync thất bại liên tiếp (lưu DB, dùng cho backoff). */
  syncRetryCount: number;
  /** Thời điểm (epoch ms) mới được phép đưa log vào hàng đợi sync; 0 = không chờ. */
  syncNextAttemptAt: number;
}

/** Khóa idempotent gửi server (id + phiên bản chỉnh sửa client). */
export const logSyncIdempotencyKey = (log: Log): string =>
  `${log.id}:${log.updatedAt}`;

export interface UpsertLogInput {
  id?: string;
  activityName: string;
  date: string;
  notes?: string;
  status: LogStatus;
}
