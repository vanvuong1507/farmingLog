import {all, call, put, takeLatest, takeLeading} from 'redux-saga/effects';
import {logActions} from '@features/logs/store/logSlice';
import {dependencies} from '@app/store/dependencies';
import type {PayloadAction} from '@reduxjs/toolkit';
import type {UpsertLogInput} from '@domain/entities/Log';
import {logger} from '@libs/logger';

function sagaErrMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function* loadLogsWorker() {
  try {
    const logs: Awaited<
      ReturnType<typeof dependencies.refreshLogsUseCase.execute>
    > = yield call([
      dependencies.refreshLogsUseCase,
      dependencies.refreshLogsUseCase.execute,
    ]);
    yield put(logActions.loadLogsSuccess(logs));
  } catch (error) {
    logger.debug('Saga', `loadLogs FAIL: ${sagaErrMessage(error)}`);
    yield put(logActions.loadLogsFailure(sagaErrMessage(error)));
  }
}

export function* addLogWorker(action: PayloadAction<UpsertLogInput>) {
  try {
    yield call(
      [dependencies.addLogUseCase, dependencies.addLogUseCase.execute],
      action.payload,
    );
    yield put(logActions.persistLogSuccess());
    yield put(logActions.loadLogsRequest());
    yield put(logActions.triggerSync());
  } catch (error) {
    logger.debug('Saga', `addLog FAIL: ${sagaErrMessage(error)}`);
    yield put(logActions.persistLogFailure(sagaErrMessage(error)));
  }
}

export function* editLogWorker(
  action: PayloadAction<{id: string; input: UpsertLogInput}>,
) {
  const {id} = action.payload;
  try {
    yield call(
      [dependencies.editLogUseCase, dependencies.editLogUseCase.execute],
      id,
      action.payload.input,
    );
    yield put(logActions.persistLogSuccess());
    yield put(logActions.loadLogsRequest());
    yield put(logActions.triggerSync());
  } catch (error) {
    logger.debug('Saga', `editLog FAIL id=${id}: ${sagaErrMessage(error)}`);
    yield put(logActions.persistLogFailure(sagaErrMessage(error)));
  }
}

export function* syncWorker() {
  try {
    const processed: number = yield call(
      [dependencies.syncEngine, dependencies.syncEngine.run],
      10,
    );
    if (processed > 0) {
      yield put(logActions.loadLogsRequest());
    }
  } catch (error) {
    logger.debug('Saga', `syncWorker FAIL: ${sagaErrMessage(error)}`);
    throw error;
  } finally {
    yield put(logActions.syncDone());
  }
}

export function* logSaga() {
  yield all([
    takeLatest(logActions.loadLogsRequest.type, loadLogsWorker),
    takeLatest(logActions.addLogRequest.type, addLogWorker),
    takeLatest(logActions.editLogRequest.type, editLogWorker),
    takeLeading(logActions.triggerSync.type, syncWorker),
  ]);
}
