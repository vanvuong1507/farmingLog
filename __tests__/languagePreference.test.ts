/**
 * @jest-environment node
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  LANGUAGE_STORAGE_KEY,
  normalizeLanguageTag,
  readStoredLanguageCode,
  resolveInitialLanguageCode,
} from '../src/libs/i18n/languagePreference';

describe('normalizeLanguageTag', () => {
  it.each([
    [undefined, 'en'],
    [null, 'en'],
    ['', 'en'],
    ['en', 'en'],
    ['EN-US', 'en'],
    ['vi', 'vi'],
    ['VI-vn', 'vi'],
    ['fr', 'en'],
  ] as const)('maps %p → %s', (input, expected) => {
    expect(normalizeLanguageTag(input)).toBe(expected);
  });
});

describe('readStoredLanguageCode', () => {
  beforeEach(() => {
    (AsyncStorage.getItem as jest.Mock).mockReset();
  });

  it('returns null when key missing or invalid', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    expect(await readStoredLanguageCode()).toBeNull();

    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('fr');
    expect(await readStoredLanguageCode()).toBeNull();
  });

  it('returns en or vi when stored', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('vi');
    expect(await readStoredLanguageCode()).toBe('vi');
    expect(AsyncStorage.getItem).toHaveBeenCalledWith(LANGUAGE_STORAGE_KEY);
  });
});

describe('resolveInitialLanguageCode', () => {
  beforeEach(() => {
    (AsyncStorage.getItem as jest.Mock).mockReset();
  });

  it('prefers stored language over device', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('vi');
    expect(await resolveInitialLanguageCode()).toBe('vi');
  });

  it('falls back to device when nothing stored', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    const code = await resolveInitialLanguageCode();
    expect(['en', 'vi']).toContain(code);
  });
});
