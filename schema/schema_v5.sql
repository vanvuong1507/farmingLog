CREATE INDEX idx_logs_syncStatus ON logs(syncStatus);

CREATE INDEX idx_logs_sync_eligible ON logs(syncStatus, syncNextAttemptAt);

CREATE INDEX idx_logs_updatedAt ON logs(updatedAt DESC);

CREATE INDEX idx_sync_jobs_runnable ON sync_jobs(status, next_attempt_at, created_at);

CREATE TABLE logs (
    id TEXT PRIMARY KEY NOT NULL,
    activityName TEXT NOT NULL,
    date TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL,
    syncStatus TEXT NOT NULL,
    updatedAt INTEGER NOT NULL
  , syncRetryCount INTEGER NOT NULL DEFAULT 0, syncNextAttemptAt INTEGER NOT NULL DEFAULT 0);

CREATE TABLE sync_jobs (
    id TEXT PRIMARY KEY NOT NULL,
    type TEXT NOT NULL,
    payload TEXT NOT NULL,
    idempotency_key TEXT NOT NULL,
    status TEXT NOT NULL,
    retry_count INTEGER NOT NULL DEFAULT 0,
    next_attempt_at INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    last_error TEXT
  );