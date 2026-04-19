import React, {memo} from 'react';
import {
  ActivityIndicator as PaperActivityIndicator,
  type ActivityIndicatorProps as PaperActivityIndicatorProps,
} from 'react-native-paper';

export type ActivityIndicatorProps = PaperActivityIndicatorProps;

export const ActivityIndicator = memo(function ActivityIndicator(
  props: ActivityIndicatorProps,
) {
  return <PaperActivityIndicator {...props} />;
});
