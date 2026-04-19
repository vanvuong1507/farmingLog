import type {Log, LogStatus, SyncStatus} from '@domain/entities/Log';

export type LogsListJsonFile = {
  version?: string;
  source?: string;
  generatedAt?: string;
  items?: unknown[];
};

function isLogStatus(v: unknown): v is LogStatus {
  return v === 'pending' || v === 'completed';
}

function isSyncStatus(v: unknown): v is SyncStatus {
  return v === 'pending' || v === 'synced' || v === 'failed';
}

function mapOne(item: unknown): Log | null {
  if (!item || typeof item !== 'object') {
    return null;
  }
  const o = item as Record<string, unknown>;
  if (typeof o.id !== 'string' || typeof o.activityName !== 'string') {
    return null;
  }
  if (typeof o.date !== 'string' || !isLogStatus(o.status)) {
    return null;
  }
  if (!isSyncStatus(o.syncStatus)) {
    return null;
  }
  if (typeof o.updatedAt !== 'number') {
    return null;
  }
  const notes =
    o.notes === undefined || o.notes === null
      ? undefined
      : typeof o.notes === 'string'
        ? o.notes
        : undefined;

  return {
    id: o.id,
    activityName: o.activityName,
    date: o.date,
    notes,
    status: o.status,
    syncStatus: o.syncStatus,
    updatedAt: o.updatedAt,
    syncRetryCount: 0,
    syncNextAttemptAt: 0,
  };
}

/** Map body GET `/api/v1/logs` (JSON) → `Log[]`. */
export function mapLogsListJsonToLogs(data: LogsListJsonFile): Log[] {
  if (!Array.isArray(data.items)) {
    return [];
  }
  const out: Log[] = [];
  for (const raw of data.items) {
    const log = mapOne(raw);
    if (log) {
      out.push(log);
    }
  }
  return out;
}
