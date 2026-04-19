/**
 * Marker hàng giả trong `SkeletonFlatList` — không trùng domain entity.
 * Dùng `isSkeletonListRow` trước khi cast về `T`.
 */
export type SkeletonListRowMarker = {
  readonly __skeletonRow: true;
  readonly skeletonKey: string;
};

export function createSkeletonListData(
  count: number,
): readonly SkeletonListRowMarker[] {
  return Array.from({length: count}, (_, i) => ({
    __skeletonRow: true as const,
    skeletonKey: `__skeleton_row__${i}`,
  }));
}

export function isSkeletonListRow(
  item: unknown,
): item is SkeletonListRowMarker {
  return (
    typeof item === 'object' &&
    item !== null &&
    '__skeletonRow' in item &&
    (item as SkeletonListRowMarker).__skeletonRow === true &&
    'skeletonKey' in item &&
    typeof (item as SkeletonListRowMarker).skeletonKey === 'string'
  );
}
