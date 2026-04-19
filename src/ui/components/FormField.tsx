import React, {memo} from 'react';
import {StyleSheet} from 'react-native';
import {Flex} from '@ui/components/Flex';
import {Text} from '@ui/components/Text';
import {space} from '@ui/tokens/layout';

export type FormFieldProps = {
  label: string;
  children: React.ReactNode;
};

/** Nhãn + control — nhãn dùng `Text` chung (bọc Paper). */
export const FormField = memo(function FormField({
  label,
  children,
}: FormFieldProps) {
  return (
    <Flex gap={space.gap / 2} style={styles.wrap}>
      <Text variant="titleMedium" style={styles.label}>
        {label}
      </Text>
      {children}
    </Flex>
  );
});

const styles = StyleSheet.create({
  wrap: {},
  label: {fontWeight: '600'},
});
