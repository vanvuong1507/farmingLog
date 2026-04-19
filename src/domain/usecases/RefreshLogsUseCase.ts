import NetInfo from '@react-native-community/netinfo';
import type {Log} from '@domain/entities/Log';
import type {LogsRemoteSource} from '@domain/ports/LogsRemoteSource';
import type {LogRepository} from '@domain/usecases/LogRepository';
import {shouldAttemptSync} from '@libs/network/shouldAttemptSync';
import {logger} from '@libs/logger';

/** Offline-first: remote GET + merge khi có mạng; luôn đọc list từ DB. `execute` đồng thời gom in-flight. */
export class RefreshLogsUseCase {
  private inFlight: Promise<Log[]> | null = null;

  constructor(
    private readonly repository: LogRepository,
    private readonly remote: LogsRemoteSource,
  ) {}

  execute(): Promise<Log[]> {
    if (this.inFlight) {
      return this.inFlight;
    }
    const run = this.runOnce();
    this.inFlight = run;
    run.finally(() => {
      if (this.inFlight === run) {
        this.inFlight = null;
      }
    });
    return run;
  }

  private async runOnce(): Promise<Log[]> {
    const net = await NetInfo.fetch();
    if (shouldAttemptSync(net)) {
      try {
        const remote = await this.remote.fetchLogsList();
        await this.repository.mergeRemoteLogs(remote);
      } catch (err) {
        logger.debug(
          'RefreshLogs',
          `GET /logs không dùng được, chỉ hiển thị local: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
    const logs = await this.repository.listLogs();
    logger.debug('RefreshLogs', `listed ${logs.length}`);
    return logs;
  }
}
