import React, {memo} from 'react';
import {StyleSheet} from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {AppSkeletonPlaceholder} from '@ui/components/skeleton/AppSkeletonPlaceholder';
import {colors} from '@ui/tokens/colors';
import {radius} from '@ui/tokens/layout';

/** Một hàng skeleton layout tương đương `LogListRow` (shimmer từ thư viện). */
export const LogListRowSkeleton = memo(function LogListRowSkeleton() {
  return (
    <AppSkeletonPlaceholder>
      <SkeletonPlaceholder.Item style={styles.card}>
        <SkeletonPlaceholder.Item
          width="72%"
          height={18}
          borderRadius={4}
          marginBottom={10}
        />
        <SkeletonPlaceholder.Item
          width="40%"
          height={14}
          borderRadius={4}
          marginBottom={10}
        />
        <SkeletonPlaceholder.Item flexDirection="row" alignItems="center">
          <SkeletonPlaceholder.Item
            width="28%"
            height={12}
            borderRadius={4}
          />
          <SkeletonPlaceholder.Item
            marginLeft={10}
            width={72}
            height={22}
            borderRadius={radius.md}
          />
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder.Item>
    </AppSkeletonPlaceholder>
  );
});

const styles = StyleSheet.create({
  card: {
    padding: 12,
    marginBottom: 10,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
});
