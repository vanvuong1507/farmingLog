import {ENABLE_DEBUG_LOGGING} from '@config/env';

const prefix = (scope: string) => `[${scope}]`;

const isJestOrNodeTest = (): boolean => {
  const proc = (globalThis as {process?: {env?: {NODE_ENV?: string}}}).process;
  return proc?.env?.NODE_ENV === 'test';
};

export const logger = {
  debug(scope: string, ...args: unknown[]) {
    if (isJestOrNodeTest()) {
      return;
    }
    if (!__DEV__ && !ENABLE_DEBUG_LOGGING) {
      return;
    }
    console.log(prefix(scope), ...args);
  },

  /** Lỗi runtime — dev: console.error; prod: có thể nối Sentry/Crashlytics sau. */
  error(scope: string, message: string, error?: unknown) {
    if (isJestOrNodeTest()) {
      return;
    }
    const err =
      error instanceof Error ? error : new Error(String(error ?? message));
    if (__DEV__) {
      console.error(prefix(scope), message, err);
    }
  },
};
