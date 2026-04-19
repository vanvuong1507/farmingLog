import {getDatabase} from '@data/db/database';
import type {SyncJob, SyncJobType} from '@domain/entities/SyncJob';
import {SYNC_JOB_TYPES} from '@domain/entities/SyncJob';

type Row = {
  id: string;
  type: string;
  payload: string;
  idempotency_key: string;
  status: SyncJob['status'];
  retry_count: number;
  next_attempt_at: number;
  created_at: number;
  last_error: string | null;
};

const isSyncJobType = (value: string): value is SyncJobType =>
  (SYNC_JOB_TYPES as readonly string[]).includes(value);

const toEntity = (row: Row): SyncJob => {
  if (!isSyncJobType(row.type)) {
    throw new Error(`Unknown sync job type: ${row.type}`);
  }
  return {
    id: row.id,
    type: row.type,
    payloadJson: row.payload,
    idempotencyKey: row.idempotency_key,
    status: row.status,
    retryCount: row.retry_count,
    nextAttemptAt: row.next_attempt_at,
    createdAt: row.created_at,
    lastError: row.last_error,
  };
};

export class SyncJobsDao {
  async supersedePendingLogPushForLogId(logId: string): Promise<void> {
    const db = await getDatabase();
    const payload = JSON.stringify({logId});
    await db.executeSql(
      `UPDATE sync_jobs
       SET status = 'done', last_error = 'superseded'
       WHERE type = 'log.push'
         AND status IN ('pending', 'failed')
         AND payload = ?;`,
      [payload],
    );
  }

  async insertJob(input: {
    id: string;
    type: SyncJobType;
    payloadJson: string;
    idempotencyKey: string;
    createdAt: number;
  }): Promise<void> {
    const db = await getDatabase();
    await db.executeSql(
      `INSERT INTO sync_jobs
      (id, type, payload, idempotency_key, status, retry_count, next_attempt_at, created_at, last_error)
      VALUES (?, ?, ?, ?, 'pending', 0, 0, ?, NULL);`,
      [
        input.id,
        input.type,
        input.payloadJson,
        input.idempotencyKey,
        input.createdAt,
      ],
    );
  }

  async listRunnable(limit: number, nowMs: number): Promise<SyncJob[]> {
    const db = await getDatabase();
    const [result] = await db.executeSql(
      `SELECT * FROM sync_jobs
       WHERE status IN ('pending', 'failed')
         AND next_attempt_at <= ?
       ORDER BY created_at ASC
       LIMIT ?;`,
      [nowMs, limit],
    );
    const rows: SyncJob[] = [];
    for (let i = 0; i < result.rows.length; i += 1) {
      rows.push(toEntity(result.rows.item(i) as Row));
    }
    return rows;
  }

  async markSucceeded(id: string): Promise<void> {
    const db = await getDatabase();
    await db.executeSql(
      `UPDATE sync_jobs SET status = 'done', last_error = NULL WHERE id = ?;`,
      [id],
    );
  }

  async markFailed(
    id: string,
    retryCount: number,
    nextAttemptAt: number,
    lastError: string,
  ): Promise<void> {
    const db = await getDatabase();
    await db.executeSql(
      `UPDATE sync_jobs
       SET status = 'failed', retry_count = ?, next_attempt_at = ?, last_error = ?
       WHERE id = ?;`,
      [retryCount, nextAttemptAt, lastError, id],
    );
  }
}
