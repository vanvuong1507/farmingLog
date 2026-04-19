import type SQLite from 'react-native-sqlite-storage';

export interface Migration {
  version: number;
  name: string;
  sql: string[];
  up: (db: SQLite.SQLiteDatabase) => Promise<void>;
  down?: (db: SQLite.SQLiteDatabase) => Promise<void>;
}
