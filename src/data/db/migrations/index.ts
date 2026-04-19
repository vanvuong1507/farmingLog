import {migration001Init} from '@data/db/migrations/001_init';
import {migration002SeedInitialLogs} from '@data/db/migrations/002_seed_initial_logs';
import {migration003SyncRetryColumns} from '@data/db/migrations/003_sync_retry_columns';
import {migration004SyncJobsTable} from '@data/db/migrations/004_sync_jobs_table';
import type {Migration} from '@data/db/migrations/types';

export const migrations: Migration[] = [
  migration001Init,
  migration002SeedInitialLogs,
  migration003SyncRetryColumns,
  migration004SyncJobsTable,
].sort((a, b) => a.version - b.version);
