import {all} from 'redux-saga/effects';
import {logSaga} from '@features/logs/sagas/logSaga';

export function* rootSaga() {
  yield all([logSaga()]);
}
