import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import type {DrawerContentComponentProps} from '@react-navigation/drawer';
import type {RootDrawerParamList} from '@app/navigation/types';
import {RootDrawerContent} from '@app/navigation/RootDrawerContent';
import {MainStackNavigator} from '@app/navigation/MainStackNavigator';
import {SettingsScreen} from '@features/settings/screens/SettingsScreen';
import {useTranslation} from 'react-i18next';

const Drawer = createDrawerNavigator<RootDrawerParamList>();

function renderRootDrawerContent(props: DrawerContentComponentProps) {
  return <RootDrawerContent {...props} />;
}

export const RootNavigator = () => {
  const {t} = useTranslation();

  return (
    <Drawer.Navigator
      drawerContent={renderRootDrawerContent}
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
      }}>
      <Drawer.Screen
        name="MainStack"
        component={MainStackNavigator}
        options={{
          drawerLabel: t('logs'),
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: t('settings'),
          drawerLabel: t('settings'),
          headerShown: true,
        }}
      />
    </Drawer.Navigator>
  );
};
