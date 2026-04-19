import React, {memo, useMemo} from 'react';
import {StyleSheet} from 'react-native';
import type {SyncStatus} from '@domain/entities/Log';
import {Flex, Text} from '@ui/components';
import {colors} from '@ui/tokens/colors';
import {radius} from '@ui/tokens/layout';

type Props = {syncStatus: SyncStatus};

export const SyncStatusBadge = memo(function SyncStatusBadge({
  syncStatus,
}: Props) {
  const badgeStyle = useMemo(() => {
    switch (syncStatus) {
      case 'pending':
        return [styles.badge, styles.badgePending];
      case 'synced':
        return [styles.badge, styles.badgeSynced];
      case 'failed':
        return [styles.badge, styles.badgeFailed];
    }
  }, [syncStatus]);

  return (
    <Flex style={badgeStyle}>
      <Text
        variant="labelSmall"
        style={[styles.label, {color: colors.onPrimary}]}
        allowFontScaling={false}>
        {syncStatus}
      </Text>
    </Flex>
  );
});

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.md,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  badgePending: {backgroundColor: colors.syncPending},
  badgeSynced: {backgroundColor: colors.syncSynced},
  badgeFailed: {backgroundColor: colors.syncFailed},
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
