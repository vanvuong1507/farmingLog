import React, {useCallback} from 'react';
import type {ListRenderItemInfo, TextStyle} from 'react-native';
import type {SkeletonListRowMarker} from '@ui/components/skeleton';
import {useFocusEffect} from '@react-navigation/native';
import {useAppDispatch, useAppSelector} from '@app/store/hooks';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '@app/navigation/types';
import {logActions} from '@features/logs/store/logSlice';
import {LogListRow} from '@features/logs/components/LogListRow';
import {LogListRowSkeleton} from '@features/logs/components/LogListRowSkeleton';
import {useTranslation} from 'react-i18next';
import {useNetInfo} from '@react-native-community/netinfo';
import type {Log} from '@domain/entities/Log';
import {Text} from '@ui/components';

const FLAT_LIST_TUNING = {
  windowSize: 7,
  maxToRenderPerBatch: 12,
  initialNumToRender: 12,
  keyboardShouldPersistTaps: 'handled' as const,
};

/**
 * Tải danh sách gắn với lifecycle **màn hình** (focus), không dùng useEffect mount-only.
 * Sau add/edit, saga vẫn dispatch loadLogsRequest — tránh lệ thuộc vào thứ tự render.
 */
export function useLogListScreen(
  navigation: NativeStackNavigationProp<RootStackParamList, 'LogList'>,
  listEmptyTextStyle: TextStyle,
) {
  const dispatch = useAppDispatch();
  const {t} = useTranslation();
  const network = useNetInfo();
  const logs = useAppSelector(state => state.logs.items);
  const listLoading = useAppSelector(state => state.logs.listLoading);
  const listError = useAppSelector(state => state.logs.error);

  /** Chỉ skeleton khi chưa có dữ liệu — tránh che list mỗi lần refocus. */
  const showListSkeleton = listLoading && logs.length === 0;

  useFocusEffect(
    useCallback(() => {
      dispatch(logActions.loadLogsRequest());
    }, [dispatch]),
  );

  const onAddLog = useCallback(() => {
    navigation.navigate('AddEditLog', {});
  }, [navigation]);

  const onSelectLog = useCallback(
    (id: string) => {
      navigation.navigate('AddEditLog', {id});
    },
    [navigation],
  );

  const keyExtractor = useCallback((item: Log) => item.id, []);

  const renderItem = useCallback(
    ({item}: ListRenderItemInfo<Log>) => (
      <LogListRow
        logId={item.id}
        activityName={item.activityName}
        date={item.date}
        status={item.status}
        syncStatus={item.syncStatus}
        onPress={onSelectLog}
      />
    ),
    [onSelectLog],
  );

  const renderListEmpty = useCallback(
    () => <Text style={listEmptyTextStyle}>{t('emptyState')}</Text>,
    [t, listEmptyTextStyle],
  );

  const renderSkeletonItem = useCallback(
    (_info: ListRenderItemInfo<SkeletonListRowMarker>) => (
      <LogListRowSkeleton />
    ),
    [],
  );

  const showOfflineBanner = network.isConnected === false;

  return {
    t,
    logs,
    listLoading,
    listError,
    showListSkeleton,
    showOfflineBanner,
    onAddLog,
    keyExtractor,
    renderItem,
    renderSkeletonItem,
    renderListEmpty,
    flatListTuning: FLAT_LIST_TUNING,
  };
}
