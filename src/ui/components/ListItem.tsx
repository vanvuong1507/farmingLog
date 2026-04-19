import React, {memo} from 'react';
import {List} from 'react-native-paper';
import type {ComponentProps} from 'react';

export type ListItemProps = ComponentProps<typeof List.Item>;

export const ListItem = memo(function ListItem(props: ListItemProps) {
  return <List.Item {...props} />;
});
