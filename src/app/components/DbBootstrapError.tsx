import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Surface, Text} from 'react-native-paper';
import {Button} from '@ui/components/Button';
import i18n from '@libs/i18n';

type Props = {
  message: string;
  onRetry: () => void;
};

export const DbBootstrapError = ({message, onRetry}: Props) => {
  return (
    <Surface style={styles.root} elevation={0}>
      <Text variant="headlineSmall" style={styles.title}>
        {i18n.t('dbOpenFailed')}
      </Text>
      <Text variant="bodyMedium" style={styles.detail}>
        {message}
      </Text>
      <View style={styles.actions}>
        <Button title={i18n.t('retry')} mode="contained" onPress={onRetry} />
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  root: {flex: 1, justifyContent: 'center', padding: 24, gap: 12},
  title: {fontWeight: '700'},
  detail: {opacity: 0.85},
  actions: {marginTop: 8},
});
