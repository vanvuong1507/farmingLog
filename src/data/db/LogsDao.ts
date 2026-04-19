import type {Log} from '@domain/entities/Log';
import {getDatabase} from '@data/db/database';

type Row = {
  id: string;
  activityName: string;
  date: string;
  notes: string | null;
  status: Log['status'];
  syncStatus: Log['syncStatus'];
  updatedAt: number;
  syncRetryCount?: number;
  syncNextAttemptAt?: number;
};

const toEntity = (row: Row): Log => ({
  id: row.id,
  activityName: row.activityName,
  date: row.date,
  notes: row.notes ?? undefined,
  status: row.status,
  syncStatus: row.syncStatus,
  updatedAt: row.updatedAt,
  syncRetryCount: row.syncRetryCount ?? 0,
  syncNextAttemptAt: row.syncNextAttemptAt ?? 0,
});

export class LogsDao {
  async listLogs(): Promise<Log[]> {
    const db = await getDatabase();
    const [result] = await db.executeSql(
      'SELECT * FROM logs ORDER BY date DESC;',
    );
    const rows: Log[] = [];
    for (let index = 0; index < result.rows.length; index += 1) {
      rows.push(toEntity(result.rows.item(index) as Row));
    }
    return rows;
  }

  async upsertLog(log: Log): Promise<void> {
    const db = await getDatabase();
    await db.executeSql(
      `INSERT OR REPLACE INTO logs
      (id, activityName, date, notes, status, syncStatus, updatedAt, syncRetryCount, syncNextAttemptAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        log.id,
        log.activityName,
        log.date,
        log.notes ?? null,
        log.status,
        log.syncStatus,
        log.updatedAt,
        log.syncRetryCount,
        log.syncNextAttemptAt,
      ],
    );
  }

  async getById(id: string): Promise<Log | null> {
    const db = await getDatabase();
    const [result] = await db.executeSql('SELECT * FROM logs WHERE id = ?;', [
      id,
    ]);
    if (result.rows.length === 0) {
      return null;
    }
    return toEntity(result.rows.item(0) as Row);
  }

  async markLogSynced(id: string): Promise<void> {
    const db = await getDatabase();
    await db.executeSql(
      `UPDATE logs SET syncStatus = ?, syncRetryCount = 0, syncNextAttemptAt = 0, updatedAt = ?
       WHERE id = ?;`,
      ['synced', Date.now(), id],
    );
  }

  async markLogSyncFailed(
    id: string,
    retryCount: number,
    nextAttemptAt: number,
  ): Promise<void> {
    const db = await getDatabase();
    await db.executeSql(
      `UPDATE logs SET syncStatus = ?, syncRetryCount = ?, syncNextAttemptAt = ?, updatedAt = ?
       WHERE id = ?;`,
      ['failed', retryCount, nextAttemptAt, Date.now(), id],
    );
  }
}
