import DeviceInfo from 'react-native-device-info';

import {APP_ENV, type AppEnv} from '@config/env';

function resolveAppEnv(): AppEnv {
  if (APP_ENV === 'development' || APP_ENV === 'uat' || APP_ENV === 'production') {
    return APP_ENV;
  }
  return __DEV__ ? 'development' : 'production';
}

/** Non-production builds: suffix aligned with `APP_ENV` (babel + dotenv). */
function envSuffix(env: AppEnv): string | null {
  if (env === 'production') {
    return null;
  }
  if (env === 'uat') {
    return 'UAT';
  }
  return 'development';
}

/**
 * Human-readable version from native layer (Android versionName / iOS CFBundleShortVersionString)
 * plus build number. Appends an environment label from `APP_ENV` when not production.
 */
export function getFormattedAppVersion(): string {
  const appVersion = DeviceInfo.getVersion();
  const buildNumber = DeviceInfo.getBuildNumber();
  const base =
    buildNumber != null && String(buildNumber).length > 0
      ? `${appVersion}-${buildNumber}`
      : appVersion;
  const label = envSuffix(resolveAppEnv());
  return label != null ? `${base} (${label})` : base;
}
