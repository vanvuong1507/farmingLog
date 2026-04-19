import React, {memo, useCallback} from 'react';
import {Pressable, StyleSheet} from 'react-native';
import type {LogStatus, SyncStatus} from '@domain/entities/Log';
import {SyncStatusBadge} from '@features/logs/components/SyncStatusBadge';
import {Flex, Text} from '@ui/components';
import {colors} from '@ui/tokens/colors';
import {radius} from '@ui/tokens/layout';

export type LogListRowProps = {
  logId: string;
  activityName: string;
  date: string;
  status: LogStatus;
  syncStatus: SyncStatus;
  onPress: (id: string) => void;
};

export const LogListRow = memo(function LogListRow({
  logId,
  activityName,
  date,
  status,
  syncStatus,
  onPress,
}: LogListRowProps) {
  const handlePress = useCallback(() => {
    onPress(logId);
  }, [onPress, logId]);

  return (
    <Pressable style={styles.card} onPress={handlePress}>
      <Flex gap={4}>
        <Text variant="titleMedium" style={styles.activity}>
          {activityName}
        </Text>
        <Text variant="bodyMedium">{date}</Text>
        <Text variant="bodySmall">{status}</Text>
        <SyncStatusBadge syncStatus={syncStatus} />
      </Flex>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 10,
  },
  activity: {fontWeight: '600'},
});
