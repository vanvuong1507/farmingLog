import NetInfo from '@react-native-community/netinfo';
import {logger} from '@libs/logger';
import {shouldAttemptSync} from '@libs/network/shouldAttemptSync';
import type {OutboxSyncRunnerDeps, SyncJobRunner} from '@services/sync/outboxSyncJobRunner';
import {createDefaultSyncJobRunner} from '@services/sync/outboxSyncJobRunner';

const MAX_DRAIN_ROUNDS = 500;

const log = (msg: string) => logger.debug('OutboxSync', msg);

/**
 * Outbox: `sync_jobs` runnable → dispatcher theo `type` → HTTP (LogsApi) + cập nhật DB.
 */
export class OutboxSyncEngine {
  private running = false;

  private constructor(
    private readonly deps: OutboxSyncRunnerDeps,
    private readonly runner: SyncJobRunner,
  ) {}

  static create(deps: OutboxSyncRunnerDeps): OutboxSyncEngine {
    return new OutboxSyncEngine(deps, createDefaultSyncJobRunner());
  }

  /** Số job đã chạy xong; 0 nếu bỏ qua hoặc không có job runnable. */
  async run(limit = 10): Promise<number> {
    if (this.running) {
      log('skip: already running');
      return 0;
    }
    const networkState = await NetInfo.fetch();
    if (!shouldAttemptSync(networkState)) {
      log('skip: offline');
      return 0;
    }

    log(`drain start limit=${limit}`);
    this.running = true;
    let processedJobCount = 0;
    try {
      let rounds = 0;
      while (rounds < MAX_DRAIN_ROUNDS) {
        rounds += 1;
        const net = await NetInfo.fetch();
        if (!shouldAttemptSync(net)) {
          log('drain stop: lost connection');
          break;
        }

        const batch = await this.deps.syncJobRepository.listRunnable(
          limit,
          Date.now(),
        );
        if (batch.length === 0) {
          log(`drain empty round=${rounds}`);
          break;
        }

        log(`jobs n=${batch.length} round=${rounds}`);
        for (const job of batch) {
          await this.runner(job, this.deps);
          processedJobCount += 1;
        }
      }
      if (rounds >= MAX_DRAIN_ROUNDS) {
        log(`drain cap rounds=${MAX_DRAIN_ROUNDS}`);
      }
      log(`drain done processed=${processedJobCount}`);
      return processedJobCount;
    } finally {
      this.running = false;
    }
  }
}
