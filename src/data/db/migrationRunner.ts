import type SQLite from 'react-native-sqlite-storage';
import {migrations} from '@data/db/migrations';
import {logger} from '@libs/logger';

const ensureMigrationTable = async (db: SQLite.SQLiteDatabase): Promise<void> => {
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY NOT NULL,
      applied_at INTEGER NOT NULL
    );
  `);
};

const getAppliedVersions = async (
  db: SQLite.SQLiteDatabase,
): Promise<Set<number>> => {
  const [result] = await db.executeSql('SELECT version FROM schema_migrations;');
  const appliedVersions = new Set<number>();

  for (let index = 0; index < result.rows.length; index += 1) {
    const row = result.rows.item(index) as {version: number};
    appliedVersions.add(row.version);
  }

  return appliedVersions;
};

export const runMigrations = async (db: SQLite.SQLiteDatabase): Promise<void> => {
  await ensureMigrationTable(db);
  const appliedVersions = await getAppliedVersions(db);

  for (const migration of migrations) {
    if (appliedVersions.has(migration.version)) {
      continue;
    }

    logger.debug(
      'Migration',
      `Running v${migration.version} ${migration.name}`,
    );
    await db.executeSql('BEGIN EXCLUSIVE TRANSACTION;');
    try {
      await migration.up(db);
      await db.executeSql(
        'INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?);',
        [migration.version, Date.now()],
      );
      await db.executeSql('COMMIT;');
    } catch (error) {
      await db.executeSql('ROLLBACK;');
      throw error;
    }
  }
};
