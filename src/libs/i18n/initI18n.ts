import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import en from '@locales/en.json';
import vi from '@locales/vi.json';
import {resolveInitialLanguageCode} from '@libs/i18n/languagePreference';

const resources = {
  en: {translation: en},
  vi: {translation: vi},
} as const;

export async function initI18n(): Promise<void> {
  if (i18n.isInitialized) {
    return;
  }
  const lng = await resolveInitialLanguageCode();
  await i18n.use(initReactI18next).init({
    compatibilityJSON: 'v4',
    resources,
    lng,
    fallbackLng: 'en',
    interpolation: {escapeValue: false},
  });
}
