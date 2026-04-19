import {API_BASE_URL, isDevelopment} from '@config/env';

const API_PREFIX = '/api/v1';

/** Có `API_BASE_URL` (bundle) → `LogsApi` dùng `fetch` thật thay fixture / simulate. */
export function isLogsRemoteHttpEnabled(): boolean {
  return API_BASE_URL.trim().length > 0;
}

function origin(): string {
  return API_BASE_URL.replace(/\/$/, '');
}

export function logsListAbsoluteUrl(): string {
  return `${origin()}${API_PREFIX}/logs`;
}

export function logPutAbsoluteUrl(logId: string): string {
  return `${origin()}${API_PREFIX}/logs/${encodeURIComponent(logId)}`;
}

/** Độ trễ giả lập khi không gọi HTTP thật (dev ngắn hơn). */
export const LOGS_HTTP_SIMULATE_LIST_MS = isDevelopment ? 80 : 150;
export const LOGS_HTTP_SIMULATE_PUT_MS = isDevelopment ? 120 : 200;
/**
 * Chỉ áp dụng khi không dùng remote HTTP (fixture PUT).
 * POC: luôn 0 để release/uat không random FAILED như dev.
 */
export const LOGS_HTTP_SIMULATE_PUT_FAIL_RATE = 0;
