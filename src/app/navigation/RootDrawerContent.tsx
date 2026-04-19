import React from 'react';
import {StyleSheet, View} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import {useTranslation} from 'react-i18next';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Text, useTheme} from 'react-native-paper';
import {getFormattedAppVersion} from '@libs/version/formatAppVersion';
import {space} from '@ui/tokens/layout';

export function RootDrawerContent(props: DrawerContentComponentProps) {
  const {t} = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollContent}
        style={styles.scroll}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      <View
        style={[
          styles.footer,
          {
            borderTopColor: theme.colors.outlineVariant,
            backgroundColor: theme.colors.surface,
            paddingBottom: Math.max(space.gap, insets.bottom),
          },
        ]}>
        <Text
          variant="bodySmall"
          style={{color: theme.colors.onSurfaceVariant}}
          numberOfLines={2}>
          {t('appVersion', {version: getFormattedAppVersion()})}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1},
  scroll: {flex: 1},
  scrollContent: {flexGrow: 1},
  footer: {
    paddingHorizontal: space.screenPadding,
    paddingVertical: space.gap,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
