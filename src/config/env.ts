/**
 * Runtime config inlined at bundle time (Babel + dotenv).
 * Add keys to `INLINE_ENV_KEYS` in babel.config.js when introducing new vars.
 */
export type AppEnv = 'development' | 'uat' | 'production';

export const APP_ENV = process.env.APP_ENV as AppEnv;

export const API_BASE_URL = process.env.API_BASE_URL ?? '';

export const ENABLE_DEBUG_LOGGING =
  process.env.ENABLE_DEBUG_LOGGING === 'true';

export const FEATURE_SYNC_ENABLED =
  process.env.FEATURE_SYNC_ENABLED === 'true';

export const isDevelopment = APP_ENV === 'development';
export const isUat = APP_ENV === 'uat';
export const isProduction = APP_ENV === 'production';
