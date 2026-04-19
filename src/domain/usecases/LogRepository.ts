import type {Log, UpsertLogInput} from '@domain/entities/Log';

export interface LogRepository {
  listLogs(): Promise<Log[]>;
  /** Áp dụng snapshot từ GET /logs (sau khi đã parse); không enqueue outbox. */
  mergeRemoteLogs(remote: Log[]): Promise<void>;
  addLog(input: UpsertLogInput): Promise<Log>;
  editLog(id: string, input: UpsertLogInput): Promise<Log>;
  /** Đọc một log theo id (dùng cho outbox handler `log.push`). */
  getLog(id: string): Promise<Log | null>;
  markLogSynced(id: string): Promise<void>;
  markLogSyncFailed(
    id: string,
    retryCount: number,
    nextAttemptAt: number,
  ): Promise<void>;
}
