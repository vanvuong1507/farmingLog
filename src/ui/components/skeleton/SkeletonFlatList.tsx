import React, {useCallback, useMemo} from 'react';
import {
  FlatList,
  type FlatListProps,
  type ListRenderItem,
  type ListRenderItemInfo,
} from 'react-native';
import {
  createSkeletonListData,
  isSkeletonListRow,
  type SkeletonListRowMarker,
} from '@ui/components/skeleton/skeletonListTypes';

export type SkeletonFlatListProps<T> = Omit<
  FlatListProps<T | SkeletonListRowMarker>,
  'data' | 'renderItem' | 'keyExtractor'
> & {
  data: readonly T[];
  /**
   * Khi `true` và `data.length === 0`, FlatList render `skeletonCount` hàng placeholder
   * (một FlatList duy nhất — hợp virtualization, không nhảy mount).
   */
  loading: boolean;
  skeletonCount?: number;
  keyExtractor: (item: T, index: number) => string;
  renderItem: ListRenderItem<T>;
  renderSkeletonItem: ListRenderItem<SkeletonListRowMarker>;
};

/**
 * `FlatList` + skeleton shimmer cho lần tải đầu (danh sách rỗng).
 * Khi có dữ liệu hoặc không loading, hành vi giống `FlatList` thường.
 */
export function SkeletonFlatList<T>({
  data,
  loading,
  skeletonCount = 8,
  keyExtractor,
  renderItem,
  renderSkeletonItem,
  ListEmptyComponent,
  extraData,
  ...rest
}: SkeletonFlatListProps<T>) {
  const showSkeleton = loading && data.length === 0;

  const listData = useMemo(
    () =>
      showSkeleton ? createSkeletonListData(skeletonCount) : (data as (T | SkeletonListRowMarker)[]),
    [showSkeleton, skeletonCount, data],
  );

  const mergedKeyExtractor = useCallback(
    (item: T | SkeletonListRowMarker, index: number) =>
      isSkeletonListRow(item) ? item.skeletonKey : keyExtractor(item, index),
    [keyExtractor],
  );

  const mergedRenderItem = useCallback(
    (info: ListRenderItemInfo<T | SkeletonListRowMarker>) =>
      isSkeletonListRow(info.item)
        ? renderSkeletonItem(
            info as ListRenderItemInfo<SkeletonListRowMarker>,
          )
        : renderItem(info as ListRenderItemInfo<T>),
    [renderItem, renderSkeletonItem],
  );

  const mergedExtraData = useMemo(
    () => ({extraData, __sk: showSkeleton, __len: data.length}),
    [extraData, showSkeleton, data.length],
  );

  return (
    <FlatList
      {...rest}
      data={listData}
      keyExtractor={mergedKeyExtractor}
      renderItem={mergedRenderItem}
      ListEmptyComponent={showSkeleton ? undefined : ListEmptyComponent}
      extraData={mergedExtraData}
    />
  );
}
