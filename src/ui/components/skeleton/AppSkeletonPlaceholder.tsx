import React, {type ReactElement, type ReactNode} from 'react';
import {useTheme} from 'react-native-paper';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

type Props = {
  children: ReactNode;
  /** Tắt shimmer (ví dụ reduce motion sau này). */
  enabled?: boolean;
  /** Thời gian một nhịp highlight (ms). */
  speed?: number;
};

/**
 * Wrapper `react-native-skeleton-placeholder` dùng màu theo Paper theme (light/dark).
 */
export function AppSkeletonPlaceholder({
  children,
  enabled = true,
  speed = 1100,
}: Props): ReactElement {
  const theme = useTheme();
  const backgroundColor = theme.colors.surfaceVariant;
  /** Tương phản vừa đủ với `surfaceVariant` trên cả sáng/tối. */
  const highlightColor = theme.dark
    ? theme.colors.background
    : theme.colors.surface;

  return (
    <SkeletonPlaceholder
      enabled={enabled}
      speed={speed}
      backgroundColor={backgroundColor}
      highlightColor={highlightColor}
      borderRadius={6}>
      {children}
    </SkeletonPlaceholder>
  );
}
