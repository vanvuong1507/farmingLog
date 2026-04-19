#!/usr/bin/env bash
set -euo pipefail

APP_ID="${1:-com.farming}"
OUT_DIR="${2:-./artifacts/db}"
DB_NAME="${3:-farming_log.db}"

mkdir -p "$OUT_DIR"

echo "[db:export] appId=$APP_ID db=$DB_NAME out=$OUT_DIR"

# Stream DB directly from app sandbox to host file.
adb exec-out "run-as $APP_ID cat databases/$DB_NAME" > "$OUT_DIR/$DB_NAME"

# Optional WAL/SHM for latest uncheckpointed changes
adb exec-out "run-as $APP_ID cat databases/$DB_NAME-wal" > "$OUT_DIR/$DB_NAME-wal" || true
adb exec-out "run-as $APP_ID cat databases/$DB_NAME-shm" > "$OUT_DIR/$DB_NAME-shm" || true

echo "[db:export] done: $OUT_DIR/$DB_NAME"
