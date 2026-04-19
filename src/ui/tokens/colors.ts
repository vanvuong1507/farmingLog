/**
 * Bảng màu tập trung — màn hình/component import từ đây thay vì rải hex.
 */
export const colors = {
  primary: '#1f6feb',
  primaryMuted: '#ddf4ff',
  border: '#d0d7de',
  text: '#24292f',
  textMuted: '#57606a',
  error: '#cf222e',
  errorLegacy: '#d73a49',
  surface: '#ffffff',
  offlineBg: '#fff4e5',
  offlineBorder: '#f59e0b',
  offlineText: '#92400e',
  onPrimary: '#ffffff',
  syncPending: '#f5a623',
  syncSynced: '#2ecc71',
  syncFailed: '#e74c3c',
} as const;

export type ColorKey = keyof typeof colors;
