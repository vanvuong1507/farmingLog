/** Backoff retry sync (outbox + cập nhật `logs`) — ms. */
export const computeSyncBackoffMs = (nextRetryCount: number): number =>
  Math.min(1000 * 2 ** nextRetryCount, 30_000);
