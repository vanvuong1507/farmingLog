import type {Migration} from '@data/db/migrations/types';
import seedData from '@data/mocks/logs.initial.json';

const toSqlString = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  if (typeof value === 'number') {
    return `${value}`;
  }
  return `'${value.replace(/'/g, "''")}'`;
};

const sql = seedData.items.map(item => {
  return `INSERT INTO logs (id, activityName, date, notes, status, syncStatus, updatedAt)
SELECT ${toSqlString(item.id)}, ${toSqlString(item.activityName)}, ${toSqlString(item.date)}, ${toSqlString(item.notes)}, ${toSqlString(item.status)}, ${toSqlString(item.syncStatus)}, ${toSqlString(item.updatedAt)}
WHERE NOT EXISTS (SELECT 1 FROM logs WHERE id = ${toSqlString(item.id)})`;
});

export const migration002SeedInitialLogs: Migration = {
  version: 2,
  name: 'seed_initial_logs',
  sql,
  up: async db => {
    for (const statement of sql) {
      await db.executeSql(`${statement};`);
    }
  },
};
