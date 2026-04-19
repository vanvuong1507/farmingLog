import i18n from 'i18next';

export {initI18n} from '@libs/i18n/initI18n';
export {
  LANGUAGE_STORAGE_KEY,
  persistLanguage,
  readStoredLanguageCode,
  getDeviceLanguageCode,
  normalizeLanguageTag,
  type SupportedLanguage,
} from '@libs/i18n/languagePreference';

export default i18n;
