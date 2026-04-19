import type {Log} from '@domain/entities/Log';
import {logSyncIdempotencyKey} from '@domain/entities/Log';
import {BaseApi} from '@data/api/core/BaseApi';
import NetInfo from '@react-native-community/netinfo';
import {logger} from '@libs/logger';
import {shouldAttemptSync} from '@libs/network/shouldAttemptSync';
import {
  mapLogsListJsonToLogs,
  type LogsListJsonFile,
} from '@data/api/logs/mapLogsListJson';
import logsListFixture from '@data/mocks/logs.initial.json';
import {
  isLogsRemoteHttpEnabled,
  logPutAbsoluteUrl,
  logsListAbsoluteUrl,
  LOGS_HTTP_SIMULATE_LIST_MS,
  LOGS_HTTP_SIMULATE_PUT_FAIL_RATE,
  LOGS_HTTP_SIMULATE_PUT_MS,
} from '@config/logsHttp';

/** Lỗi transport (không tới được server) — khác 4xx/5xx từ HTTP. */
function isUnreachableRemoteError(error: unknown): boolean {
  if (error instanceof TypeError) {
    return true;
  }
  const msg = error instanceof Error ? error.message : String(error);
  return /Network request failed|Failed to fetch|ECONNREFUSED|ENOTFOUND|ConnectException|SocketTimeout|timed out/i.test(
    msg,
  );
}

export class LogsApi extends BaseApi {
  private async loadFixtureList(): Promise<Log[]> {
    await this.simulateRequest(LOGS_HTTP_SIMULATE_LIST_MS);
    logger.debug('LogsApi', 'GET /api/v1/logs → bundled fixture');
    return mapLogsListJsonToLogs(logsListFixture);
  }

  private async runFixturePut(): Promise<void> {
    await this.simulateRequest(LOGS_HTTP_SIMULATE_PUT_MS);
    if (Math.random() < LOGS_HTTP_SIMULATE_PUT_FAIL_RATE) {
      throw new Error('Sync failed (fixture simulate)');
    }
  }

  async fetchLogsList(): Promise<Log[]> {
    if (!isLogsRemoteHttpEnabled()) {
      return this.loadFixtureList();
    }

    const url = logsListAbsoluteUrl();
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`GET logs HTTP ${res.status}`);
      }
      const json = (await res.json()) as LogsListJsonFile;
      return mapLogsListJsonToLogs(json);
    } catch (err) {
      if (isUnreachableRemoteError(err)) {
        logger.debug(
          'LogsApi',
          `GET remote unreachable (${url}), using fixture: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
        return this.loadFixtureList();
      }
      throw err;
    }
  }

  async syncLog(log: Log): Promise<void> {
    const state = await NetInfo.fetch();
    if (!shouldAttemptSync(state)) {
      throw new Error('Network is offline');
    }

    const idem = logSyncIdempotencyKey(log);

    if (!isLogsRemoteHttpEnabled()) {
      await this.runFixturePut();
      return;
    }

    const url = logPutAbsoluteUrl(log.id);
    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Idempotency-Key': idem,
        },
        body: JSON.stringify({
          activityName: log.activityName,
          date: log.date,
          notes: log.notes ?? null,
          status: log.status,
          updatedAt: log.updatedAt,
        }),
      });
      if (!res.ok) {
        throw new Error(`PUT log HTTP ${res.status}`);
      }
    } catch (err) {
      if (isUnreachableRemoteError(err)) {
        logger.debug(
          'LogsApi',
          `PUT remote unreachable (${url}), using fixture simulate: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
        await this.runFixturePut();
        return;
      }
      throw err;
    }
  }
}
