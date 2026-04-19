/**
 * @jest-environment node
 */
import {LogsApi} from '../src/data/api/logs/LogsApi';

jest.mock('@config/env', () => ({
  isDevelopment: false,
  API_BASE_URL: 'http://127.0.0.1:9',
}));

jest.mock('@config/logsHttp', () => ({
  isLogsRemoteHttpEnabled: () => true,
  logsListAbsoluteUrl: () => 'http://127.0.0.1:9/api/v1/logs',
  logPutAbsoluteUrl: (id: string) => `http://127.0.0.1:9/api/v1/logs/${id}`,
  LOGS_HTTP_SIMULATE_LIST_MS: 0,
  LOGS_HTTP_SIMULATE_PUT_MS: 0,
  LOGS_HTTP_SIMULATE_PUT_FAIL_RATE: 0,
}));

jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    fetch: jest.fn(() =>
      Promise.resolve({isConnected: true, isInternetReachable: true}),
    ),
  },
}));

describe('LogsApi unreachable host → fixture (mọi APP_ENV)', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('fetchLogsList falls back to fixture when fetch throws', async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new TypeError('Network request failed')),
    );
    const api = new LogsApi();
    const logs = await api.fetchLogsList();
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0]).toHaveProperty('id');
  });

  it('syncLog succeeds via fixture simulate when PUT throws', async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('Network request failed')),
    );
    const api = new LogsApi();
    await expect(
      api.syncLog({
        id: 'x',
        activityName: 'A',
        date: '2026-01-01',
        status: 'pending',
        syncStatus: 'pending',
        updatedAt: 1,
        syncRetryCount: 0,
        syncNextAttemptAt: 0,
      }),
    ).resolves.toBeUndefined();
  });
});
