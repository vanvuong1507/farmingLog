import NetInfo from '@react-native-community/netinfo';
import {store} from '@app/store/store';
import {logActions} from '@features/logs/store/logSlice';
import {logger} from '@libs/logger';
import {shouldAttemptSync} from '@libs/network/shouldAttemptSync';

let unsubscribe: (() => void) | null = null;
/** Tránh dispatch `triggerSync` lặp khi NetInfo bắn nhiều sự kiện cùng trạng thái online. */
let lastNotifiedSyncEligible: boolean | null = null;
/** Chỉ log khi bộ trạng thái thực sự đổi (NetInfo hay lặp cùng connected/reachable). */
let lastNetworkSignature: string | null = null;

export const startNetworkSyncBootstrap = () => {
  if (unsubscribe) {
    return;
  }

  unsubscribe = NetInfo.addEventListener(state => {
    const canSync = shouldAttemptSync(state);
    const signature = `${String(state.isConnected)}|${String(state.isInternetReachable)}|${canSync}`;
    if (signature !== lastNetworkSignature) {
      lastNetworkSignature = signature;
      logger.debug(
        'Network',
        `status changed: connected=${Boolean(state.isConnected)} internetReachable=${String(state.isInternetReachable)} → syncEligible=${canSync}`,
      );
    }
    const becameEligible = canSync && lastNotifiedSyncEligible !== true;
    lastNotifiedSyncEligible = canSync;

    if (becameEligible) {
      logger.debug('Network', 'syncEligible → triggerSync');
      store.dispatch(logActions.triggerSync());
    }
  });
};

export const stopNetworkSyncBootstrap = () => {
  unsubscribe?.();
  unsubscribe = null;
  lastNotifiedSyncEligible = null;
  lastNetworkSignature = null;
};
