export type AppThemeMode = 'light' | 'dark' | 'system';

export type ResolvedAppearance = 'light' | 'dark';

/** Giải `system` theo scheme hệ thống; các mode cố định giữ nguyên. */
export function resolveAppearance(
  mode: AppThemeMode,
  systemScheme: string | null | undefined,
): ResolvedAppearance {
  if (mode === 'light') {
    return 'light';
  }
  if (mode === 'dark') {
    return 'dark';
  }
  return systemScheme === 'dark' ? 'dark' : 'light';
}
