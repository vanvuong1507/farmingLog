CREATE TABLE logs (
    id TEXT PRIMARY KEY NOT NULL,
    activityName TEXT NOT NULL,
    date TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL,
    syncStatus TEXT NOT NULL,
    updatedAt INTEGER NOT NULL,
    syncRetryCount INTEGER NOT NULL DEFAULT 0,
    syncNextAttemptAt INTEGER NOT NULL DEFAULT 0
  );

CREATE INDEX idx_logs_syncStatus ON logs(syncStatus);

CREATE INDEX idx_logs_updatedAt ON logs(updatedAt DESC);

CREATE INDEX IF NOT EXISTS idx_logs_sync_eligible ON logs(syncStatus, syncNextAttemptAt);
