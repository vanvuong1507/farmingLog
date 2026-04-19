import React, {useCallback} from 'react';
import {StyleSheet, View} from 'react-native';
import type {DrawerScreenProps} from '@react-navigation/drawer';
import {useTranslation} from 'react-i18next';
import type {RootDrawerParamList} from '@app/navigation/types';
import i18n, {persistLanguage} from '@libs/i18n';
import {useThemeMode, type AppThemeMode} from '@ui/theme';
import {getFormattedAppVersion} from '@libs/version/formatAppVersion';
import {Button, Screen, Text} from '@ui/components';
import {space} from '@ui/tokens/layout';

type Props = DrawerScreenProps<RootDrawerParamList, 'Settings'>;

export const SettingsScreen = (_props: Props) => {
  const {t} = useTranslation();
  const {mode, setMode} = useThemeMode();
  const currentLang = i18n.language?.startsWith('vi') ? 'vi' : 'en';

  const switchToEnglish = useCallback(() => {
    (async () => {
      await i18n.changeLanguage('en');
      await persistLanguage('en');
    })().catch(() => undefined);
  }, []);

  const switchToVietnamese = useCallback(() => {
    (async () => {
      await i18n.changeLanguage('vi');
      await persistLanguage('vi');
    })().catch(() => undefined);
  }, []);

  const setThemeMode = useCallback(
    (next: AppThemeMode) => {
      setMode(next);
    },
    [setMode],
  );

  return (
    <Screen style={styles.screen}>
      <Text variant="titleLarge" style={styles.sectionTitle}>
        {t('language')}
      </Text>
      <View style={styles.row}>
        <Button
          mode={currentLang === 'en' ? 'contained' : 'outlined'}
          compact
          title={t('langEnglish')}
          onPress={switchToEnglish}
          style={styles.flexBtn}
        />
        <Button
          mode={currentLang === 'vi' ? 'contained' : 'outlined'}
          compact
          title={t('langVietnamese')}
          onPress={switchToVietnamese}
          style={styles.flexBtn}
        />
      </View>

      <Text variant="titleLarge" style={styles.sectionTitle}>
        {t('appearance')}
      </Text>
      <View style={styles.column}>
        <Button
          mode={mode === 'system' ? 'contained' : 'outlined'}
          compact
          title={t('themePreferenceSystem')}
          onPress={() => setThemeMode('system')}
          style={styles.themeBtn}
        />
        <Button
          mode={mode === 'light' ? 'contained' : 'outlined'}
          compact
          title={t('themePreferenceLight')}
          onPress={() => setThemeMode('light')}
          style={styles.themeBtn}
        />
        <Button
          mode={mode === 'dark' ? 'contained' : 'outlined'}
          compact
          title={t('themePreferenceDark')}
          onPress={() => setThemeMode('dark')}
          style={styles.themeBtn}
        />
      </View>

      <Text variant="titleLarge" style={styles.sectionTitle}>
        {t('about')}
      </Text>
      <Text variant="bodyMedium" style={styles.versionLine}>
        {t('appVersion', {version: getFormattedAppVersion()})}
      </Text>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: {flex: 1},
  sectionTitle: {marginBottom: space.gap},
  row: {
    flexDirection: 'row',
    gap: space.gap,
    marginBottom: space.screenPadding,
  },
  column: {gap: space.gap, marginBottom: space.screenPadding},
  flexBtn: {flex: 1},
  themeBtn: {alignSelf: 'stretch'},
  versionLine: {opacity: 0.85},
});
