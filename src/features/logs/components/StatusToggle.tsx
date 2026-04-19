import React, {memo, useCallback} from 'react';
import {Pressable, StyleSheet} from 'react-native';
import type {LogStatus} from '@domain/entities/Log';
import {Flex, Text} from '@ui/components';
import {colors} from '@ui/tokens/colors';
import {radius} from '@ui/tokens/layout';

const OPTIONS: LogStatus[] = ['pending', 'completed'];

type OptionProps = {
  item: LogStatus;
  selected: boolean;
  onSelect: (value: LogStatus) => void;
};

const StatusOption = memo(function StatusOption({
  item,
  selected,
  onSelect,
}: OptionProps) {
  const handlePress = useCallback(() => {
    onSelect(item);
  }, [onSelect, item]);

  return (
    <Pressable
      style={[styles.statusButton, selected ? styles.statusActive : null]}
      onPress={handlePress}>
      <Text variant="bodyMedium">{item}</Text>
    </Pressable>
  );
});

export type StatusToggleProps = {
  value: LogStatus;
  onChange: (value: LogStatus) => void;
};

export const StatusToggle = memo(function StatusToggle({
  value,
  onChange,
}: StatusToggleProps) {
  return (
    <Flex direction="row" gap={8}>
      {OPTIONS.map(item => (
        <StatusOption
          key={item}
          item={item}
          selected={item === value}
          onSelect={onChange}
        />
      ))}
    </Flex>
  );
});

const styles = StyleSheet.create({
  statusButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
  },
  statusActive: {backgroundColor: colors.primaryMuted},
});
