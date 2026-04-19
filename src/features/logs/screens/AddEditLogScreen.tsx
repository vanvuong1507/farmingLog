import React from 'react';
import {StyleSheet} from 'react-native';
import {Controller} from 'react-hook-form';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '@app/navigation/types';
import {StatusToggle} from '@features/logs/components/StatusToggle';
import {useAddEditLogScreen} from '@features/logs/hooks/useAddEditLogScreen';
import {Flex, PrimaryButton, Text, TextField} from '@ui/components';
import {colors} from '@ui/tokens/colors';
import {space} from '@ui/tokens/layout';

type Props = NativeStackScreenProps<RootStackParamList, 'AddEditLog'>;

export const AddEditLogScreen = ({navigation, route}: Props) => {
  const vm = useAddEditLogScreen(navigation, route);

  return (
    <Flex
      flex={1}
      padding={space.screenPadding}
      gap={space.gap}
      style={styles.container}>
      <Controller
        control={vm.control}
        name="activityName"
        render={({
          field: {value, onChange, onBlur},
          fieldState: {error, isTouched, isDirty},
          formState,
        }) => {
          const showError =
            !!error && (isTouched || isDirty || formState.isSubmitted);
          return (
            <Flex gap={4}>
              <TextField
                label={vm.t('activityName')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={showError}
              />
              {showError && error?.message ? (
                <Text variant="bodySmall" style={{color: colors.error}}>
                  {error.message}
                </Text>
              ) : null}
            </Flex>
          );
        }}
      />
      <Controller
        control={vm.control}
        name="date"
        render={({
          field: {value, onChange, onBlur},
          fieldState: {error, isTouched, isDirty},
          formState,
        }) => {
          const showError =
            !!error && (isTouched || isDirty || formState.isSubmitted);
          return (
            <Flex gap={4}>
              <TextField
                label={vm.t('date')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={showError}
              />
              {showError && error?.message ? (
                <Text variant="bodySmall" style={{color: colors.error}}>
                  {error.message}
                </Text>
              ) : null}
            </Flex>
          );
        }}
      />
      <Controller
        control={vm.control}
        name="notes"
        render={({field: {value, onChange, onBlur}}) => (
          <TextField
            label={vm.t('notes')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            multiline
            numberOfLines={4}
            style={styles.notesField}
          />
        )}
      />
      <Controller
        control={vm.control}
        name="status"
        render={({field: {value, onChange}}) => (
          <StatusToggle value={value} onChange={onChange} />
        )}
      />
      {vm.persistError ? (
        <Flex gap={4}>
          <Text
            variant="bodyMedium"
            typography="semiBold"
            style={{color: colors.error}}>
            {vm.t('saveFailed')}
          </Text>
          <Text variant="bodySmall" style={{color: colors.textMuted}}>
            {vm.persistError}
          </Text>
        </Flex>
      ) : null}
      <Flex style={styles.submitWrap}>
        <PrimaryButton
          title={vm.t('save')}
          onPress={vm.onSubmit}
          disabled={!vm.canSubmit}
        />
      </Flex>
    </Flex>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  notesField: {minHeight: 100},
  submitWrap: {marginTop: 8},
});
