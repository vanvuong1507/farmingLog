import type {Migration} from '@data/db/migrations/types';

const sql = [
  'ALTER TABLE logs ADD COLUMN syncRetryCount INTEGER NOT NULL DEFAULT 0',
  'ALTER TABLE logs ADD COLUMN syncNextAttemptAt INTEGER NOT NULL DEFAULT 0',
  'CREATE INDEX IF NOT EXISTS idx_logs_sync_eligible ON logs(syncStatus, syncNextAttemptAt)',
];

export const migration003SyncRetryColumns: Migration = {
  version: 3,
  name: 'sync_retry_columns',
  sql,
  up: async db => {
    for (const statement of sql) {
      await db.executeSql(`${statement};`);
    }
  },
};
