import React from 'react';
import {
  createNativeStackNavigator,
  type NativeStackHeaderProps,
} from '@react-navigation/native-stack';
import type {RootStackParamList} from '@app/navigation/types';
import {
  NativeStackAppHeader,
  type NativeStackAppHeaderLeading,
} from '@ui/navigation';
import {LogListScreen} from '@features/logs/screens/LogListScreen';
import {AddEditLogScreen} from '@features/logs/screens/AddEditLogScreen';
import {useTranslation} from 'react-i18next';

const Stack = createNativeStackNavigator<RootStackParamList>();

function leadingForMainStackRoute(
  name: keyof RootStackParamList,
): NativeStackAppHeaderLeading {
  return name === 'LogList' ? 'menu' : 'back';
}

function MainStackAppHeader(props: NativeStackHeaderProps) {
  const leading = leadingForMainStackRoute(
    props.route.name as keyof RootStackParamList,
  );
  return <NativeStackAppHeader {...props} leading={leading} />;
}

export const MainStackNavigator = () => {
  const {t} = useTranslation();

  return (
    <Stack.Navigator screenOptions={{header: MainStackAppHeader}}>
      <Stack.Screen name="LogList" component={LogListScreen} options={{title: t('logs')}} />
      <Stack.Screen
        name="AddEditLog"
        component={AddEditLogScreen}
        options={{title: t('addEditLog')}}
      />
    </Stack.Navigator>
  );
};
