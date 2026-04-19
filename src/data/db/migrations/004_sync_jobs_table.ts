import type SQLite from 'react-native-sqlite-storage';
import type {Migration} from '@data/db/migrations/types';

const createJobId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const ddl = [
  `CREATE TABLE IF NOT EXISTS sync_jobs (
    id TEXT PRIMARY KEY NOT NULL,
    type TEXT NOT NULL,
    payload TEXT NOT NULL,
    idempotency_key TEXT NOT NULL,
    status TEXT NOT NULL,
    retry_count INTEGER NOT NULL DEFAULT 0,
    next_attempt_at INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    last_error TEXT
  )`,
  'CREATE INDEX IF NOT EXISTS idx_sync_jobs_runnable ON sync_jobs(status, next_attempt_at, created_at)',
];

/**
 * Backfill: mỗi log pending/failed → một job `log.push` (dual-write với syncStatus trên logs).
 * Chạy trong `up` vì cần đọc bảng `logs` sau khi tạo `sync_jobs`.
 */
async function backfillFromPendingLogs(db: SQLite.SQLiteDatabase): Promise<void> {
  const [result] = await db.executeSql(
    `SELECT id, updatedAt FROM logs WHERE syncStatus IN ('pending', 'failed');`,
  );
  const now = Date.now();
  for (let i = 0; i < result.rows.length; i += 1) {
    const row = result.rows.item(i) as {id: string; updatedAt: number};
    const jobId = createJobId();
    const payload = JSON.stringify({logId: row.id});
    const idempotencyKey = `${row.id}:${row.updatedAt}`;
    await db.executeSql(
      `INSERT INTO sync_jobs
      (id, type, payload, idempotency_key, status, retry_count, next_attempt_at, created_at, last_error)
      VALUES (?, 'log.push', ?, ?, 'pending', 0, 0, ?, NULL);`,
      [jobId, payload, idempotencyKey, now],
    );
  }
}

export const migration004SyncJobsTable: Migration = {
  version: 4,
  name: 'sync_jobs_outbox',
  sql: ddl,
  up: async db => {
    for (const statement of ddl) {
      await db.executeSql(`${statement};`);
    }
    await backfillFromPendingLogs(db);
  },
};
