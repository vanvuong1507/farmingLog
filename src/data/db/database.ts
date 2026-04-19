import SQLite from 'react-native-sqlite-storage';
import {runMigrations} from '@data/db/migrationRunner';

SQLite.enablePromise(true);

const DB_NAME = 'farming_log.db';
const DB_LOCATION = 'default';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await SQLite.openDatabase({
    name: DB_NAME,
    location: DB_LOCATION,
  });
  await runMigrations(dbInstance);

  return dbInstance;
};
