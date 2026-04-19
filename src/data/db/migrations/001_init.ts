import type {Migration} from '@data/db/migrations/types';

const sql = [
  `CREATE TABLE IF NOT EXISTS logs (
    id TEXT PRIMARY KEY NOT NULL,
    activityName TEXT NOT NULL,
    date TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL,
    syncStatus TEXT NOT NULL,
    updatedAt INTEGER NOT NULL
  )`,
  'CREATE INDEX IF NOT EXISTS idx_logs_syncStatus ON logs(syncStatus)',
  'CREATE INDEX IF NOT EXISTS idx_logs_updatedAt ON logs(updatedAt DESC)',
];

export const migration001Init: Migration = {
  version: 1,
  name: 'init_logs_table',
  sql,
  up: async db => {
    for (const statement of sql) {
      await db.executeSql(`${statement};`);
    }
  },
};
