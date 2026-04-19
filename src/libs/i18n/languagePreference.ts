import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RNLocalize from 'react-native-localize';

/** Key lưu trong AsyncStorage (persistent qua khởi động lại app). */
export const LANGUAGE_STORAGE_KEY = '@farming/app_language';

export type SupportedLanguage = 'en' | 'vi';

export function normalizeLanguageTag(
  tag: string | undefined | null,
): SupportedLanguage {
  if (!tag) {
    return 'en';
  }
  const lower = tag.toLowerCase();
  if (lower.startsWith('vi')) {
    return 'vi';
  }
  return 'en';
}

/** Ngôn ngữ ưu tiên theo cài đặt hệ thống (thiết bị). */
export function getDeviceLanguageCode(): SupportedLanguage {
  const tag = RNLocalize.getLocales()[0]?.languageTag;
  return normalizeLanguageTag(tag);
}

/** Giá trị user đã chọn trước đó (nếu có). */
export async function readStoredLanguageCode(): Promise<SupportedLanguage | null> {
  const raw = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (raw === 'en' || raw === 'vi') {
    return raw;
  }
  return null;
}

/** Ưu tiên: đã lưu → thiết bị → en. */
export async function resolveInitialLanguageCode(): Promise<SupportedLanguage> {
  const stored = await readStoredLanguageCode();
  return stored ?? getDeviceLanguageCode();
}

export async function persistLanguage(
  lang: SupportedLanguage,
): Promise<void> {
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
}
