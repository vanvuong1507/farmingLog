import React, {useCallback} from 'react';
import {DrawerActions} from '@react-navigation/native';
import {getHeaderTitle} from '@react-navigation/elements';
import type {NativeStackHeaderProps} from '@react-navigation/native-stack';
import {Appbar} from 'react-native-paper';
import {useTranslation} from 'react-i18next';

/** Cạnh trái Appbar: drawer menu, nút back, hoặc không. */
export type NativeStackAppHeaderLeading = 'menu' | 'back' | 'none';

export type NativeStackAppHeaderProps = NativeStackHeaderProps & {
  leading: NativeStackAppHeaderLeading;
};

/**
 * Header Material dùng chung cho `@react-navigation/native-stack` + React Native Paper.
 * Dùng `options.header` thay cho header native mặc định để đồng bộ theme Paper và dễ mở rộng (action phải, subtitle, v.v.).
 */
export function NativeStackAppHeader({
  navigation,
  route,
  options,
  leading,
}: NativeStackAppHeaderProps) {
  const {t} = useTranslation();
  const title = getHeaderTitle(options, route.name);

  const openDrawer = useCallback(() => {
    const parent = navigation.getParent?.();
    if (parent != null) {
      parent.dispatch(DrawerActions.openDrawer());
    } else {
      navigation.dispatch(DrawerActions.openDrawer());
    }
  }, [navigation]);

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const showBack = leading === 'back' && navigation.canGoBack();

  return (
    <Appbar.Header elevated mode="small">
      {leading === 'menu' ? (
        <Appbar.Action
          isLeading
          icon="menu"
          accessibilityLabel={t('openMenu')}
          onPress={openDrawer}
        />
      ) : showBack ? (
        <Appbar.BackAction onPress={goBack} />
      ) : null}
      <Appbar.Content title={title} />
    </Appbar.Header>
  );
}
