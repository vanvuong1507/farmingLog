import React from 'react';
import {Platform, StyleSheet} from 'react-native';
import {Banner} from 'react-native-paper';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '@app/navigation/types';
import {useLogListScreen} from '@features/logs/hooks/useLogListScreen';
import {Flex, PrimaryButton, Screen, SkeletonFlatList, Text} from '@ui/components';
import {colors} from '@ui/tokens/colors';
import {space} from '@ui/tokens/layout';

type Props = NativeStackScreenProps<RootStackParamList, 'LogList'>;

export const LogListScreen = ({navigation}: Props) => {
  const vm = useLogListScreen(navigation, styles.emptyText);

  return (
    <Screen style={styles.screen} padded={false}>
      <Flex
        flex={1}
        padding={space.screenPadding}
        gap={space.gap}
        style={styles.inner}>
        <PrimaryButton title={vm.t('addLog')} onPress={vm.onAddLog} />
        {vm.showOfflineBanner ? (
          <Banner visible icon="wifi-off" style={styles.offlineBanner}>
            {vm.t('offlineBanner')}
          </Banner>
        ) : null}
        {vm.listError != null && vm.listError !== '' ? (
          <Text variant="bodyMedium" style={styles.errorText}>
            {vm.listError}
          </Text>
        ) : null}
        <SkeletonFlatList
          style={styles.listFlex}
          data={vm.logs}
          loading={vm.showListSkeleton}
          skeletonCount={8}
          keyExtractor={vm.keyExtractor}
          renderItem={vm.renderItem}
          renderSkeletonItem={vm.renderSkeletonItem}
          ListEmptyComponent={vm.renderListEmpty}
          removeClippedSubviews={Platform.OS === 'android'}
          {...vm.flatListTuning}
        />
      </Flex>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: {flex: 1},
  inner: {flex: 1},
  listFlex: {flex: 1},
  offlineBanner: {
    backgroundColor: colors.offlineBg,
    borderColor: colors.offlineBorder,
    borderWidth: StyleSheet.hairlineWidth,
  },
  emptyText: {paddingVertical: 8},
  errorText: {color: colors.errorLegacy},
});
