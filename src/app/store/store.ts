import createSagaMiddleware from 'redux-saga';
import {configureStore} from '@reduxjs/toolkit';
import {logReducer} from '@features/logs/store/logSlice';
import {rootSaga} from '@app/store/rootSaga';

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    logs: logReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({thunk: false}).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
