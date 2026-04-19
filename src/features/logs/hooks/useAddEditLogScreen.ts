import {useCallback, useEffect, useMemo, useLayoutEffect} from 'react';
import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {useAppDispatch, useAppSelector} from '@app/store/hooks';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RouteProp} from '@react-navigation/native';
import {useFocusEffect} from '@react-navigation/native';
import type {RootStackParamList} from '@app/navigation/types';
import {logActions} from '@features/logs/store/logSlice';
import type {Log} from '@domain/entities/Log';
import {
  createAddEditLogFormSchema,
  type AddEditLogFormValues,
} from '@features/logs/addEditLogFormSchema';

type Nav = NativeStackNavigationProp<RootStackParamList, 'AddEditLog'>;
type Route = RouteProp<RootStackParamList, 'AddEditLog'>;

function formDefaults(log: Log | undefined): AddEditLogFormValues {
  return {
    activityName: log?.activityName ?? '',
    date: log?.date ?? new Date().toISOString().slice(0, 10),
    notes: log?.notes ?? '',
    status: log?.status ?? 'pending',
  };
}

export function useAddEditLogScreen(navigation: Nav, route: Route) {
  const {t} = useTranslation();
  const dispatch = useAppDispatch();
  const editingLog = useAppSelector(state =>
    state.logs.items.find(item => item.id === route.params?.id),
  );
  const persistJustSucceeded = useAppSelector(
    state => state.logs.persistJustSucceeded,
  );
  const persistError = useAppSelector(state => state.logs.persistError);
  const saving = useAppSelector(state => state.logs.persistLoading);

  const schema = useMemo(() => createAddEditLogFormSchema(t), [t]);
  const resolver = useMemo(() => zodResolver(schema), [schema]);

  const {control, handleSubmit, reset, trigger, formState} =
    useForm<AddEditLogFormValues>({
      resolver,
      defaultValues: formDefaults(editingLog),
      mode: 'onChange',
    });

  const routeLogId = route.params?.id;

  useEffect(() => {
    reset(formDefaults(editingLog));
    trigger().catch(() => {});
    // Chỉ reset khi đổi log đang sửa / route; không phụ thuộc reference Redux để tránh xoá input đang gõ.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeLogId, editingLog?.id, reset, trigger]);

  useFocusEffect(
    useCallback(() => {
      dispatch(logActions.resetPersistFormState());
    }, [dispatch]),
  );

  useLayoutEffect(() => {
    if (!persistJustSucceeded) {
      return;
    }
    dispatch(logActions.acknowledgePersistSuccess());
    navigation.goBack();
  }, [persistJustSucceeded, navigation, dispatch]);

  const canSubmit = formState.isValid && !saving;

  const onSubmit = useMemo(
    () =>
      handleSubmit(values => {
        if (saving) {
          return;
        }
        const {activityName: name, date, notes, status} = values;
        if (editingLog) {
          dispatch(
            logActions.editLogRequest({
              id: editingLog.id,
              input: {activityName: name, date, notes, status},
            }),
          );
        } else {
          dispatch(
            logActions.addLogRequest({
              activityName: name,
              date,
              notes,
              status,
            }),
          );
        }
      }),
    [handleSubmit, saving, editingLog, dispatch],
  );

  return {
    t,
    control,
    persistError,
    canSubmit,
    onSubmit,
  };
}
