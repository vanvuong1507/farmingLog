import {useCallback, useEffect, useState} from 'react';
import {getDatabase} from '@data/db/database';
import {store} from '@app/store/store';
import {dependencies} from '@app/store/dependencies';
import {logActions} from '@features/logs/store/logSlice';
import {
  startNetworkSyncBootstrap,
  stopNetworkSyncBootstrap,
} from '@libs/network/networkSyncBootstrap';
import {logger} from '@libs/logger';
import {initI18n} from '@libs/i18n';

export const AppBootPhase = {
  Loading: 'loading',
  Ready: 'ready',
  Error: 'error',
} as const;

export type AppBootPhase = (typeof AppBootPhase)[keyof typeof AppBootPhase];

export function useAppBootstrap() {
  const [phase, setPhase] = useState<AppBootPhase>(AppBootPhase.Loading);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const runBootstrap = useCallback(async () => {
    setPhase(AppBootPhase.Loading);
    setErrorMessage(null);
    try {
      await initI18n();
      await getDatabase();
      startNetworkSyncBootstrap();
      await dependencies.backgroundScheduler
        .start(async () => {
          logger.debug('BackgroundSync', 'BackgroundFetch → triggerSync');
          store.dispatch(logActions.triggerSync());
        })
        .catch(schedulerErr => {
          logger.error(
            'Bootstrap',
            'BackgroundScheduler start failed',
            schedulerErr,
          );
        });
      setPhase(AppBootPhase.Ready);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error('Bootstrap', 'Database open or migrate failed', err);
      setErrorMessage(message);
      setPhase(AppBootPhase.Error);
    }
  }, []);

  useEffect(() => {
    runBootstrap().catch(() => {
      /* lỗi đã xử lý trong runBootstrap */
    });
    return () => {
      stopNetworkSyncBootstrap();
    };
  }, [runBootstrap]);

  const retry = useCallback(() => {
    runBootstrap().catch(() => {
      /* lỗi đã xử lý trong runBootstrap */
    });
  }, [runBootstrap]);

  return {phase, errorMessage, retry};
}
