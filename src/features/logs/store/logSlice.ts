import {createSlice, type PayloadAction} from '@reduxjs/toolkit';
import type {Log, UpsertLogInput} from '@domain/entities/Log';

export interface LogState {
  items: Log[];
  /** Tải danh sách từ DB (list + refresh sau sync) */
  listLoading: boolean;
  /** Đang ghi form thêm/sửa */
  persistLoading: boolean;
  syncing: boolean;
  /** Lỗi khi tải danh sách từ DB */
  error?: string;
  /** Lỗi khi thêm/sửa log */
  persistError?: string;
  /** Saga persist xong — màn Add/Edit lắng nghe để goBack */
  persistJustSucceeded: boolean;
}

const initialState: LogState = {
  items: [],
  listLoading: false,
  persistLoading: false,
  syncing: false,
  persistJustSucceeded: false,
};

const logSlice = createSlice({
  name: 'logs',
  initialState,
  reducers: {
    loadLogsRequest(state) {
      state.listLoading = true;
      state.error = undefined;
    },
    loadLogsSuccess(state, action: PayloadAction<Log[]>) {
      state.listLoading = false;
      state.items = action.payload;
    },
    loadLogsFailure(state, action: PayloadAction<string>) {
      state.listLoading = false;
      state.error = action.payload;
    },
    addLogRequest(state, _action: PayloadAction<UpsertLogInput>) {
      state.persistLoading = true;
      state.persistError = undefined;
      state.persistJustSucceeded = false;
    },
    editLogRequest(
      state,
      _action: PayloadAction<{id: string; input: UpsertLogInput}>,
    ) {
      state.persistLoading = true;
      state.persistError = undefined;
      state.persistJustSucceeded = false;
    },
    persistLogSuccess(state) {
      state.persistLoading = false;
      state.persistError = undefined;
      state.persistJustSucceeded = true;
    },
    persistLogFailure(state, action: PayloadAction<string>) {
      state.persistLoading = false;
      state.persistError = action.payload;
      state.persistJustSucceeded = false;
    },
    acknowledgePersistSuccess(state) {
      state.persistJustSucceeded = false;
    },
    resetPersistFormState(state) {
      state.persistError = undefined;
      state.persistJustSucceeded = false;
    },
    triggerSync(state) {
      state.syncing = true;
    },
    syncDone(state) {
      state.syncing = false;
    },
  },
});

export const logActions = logSlice.actions;
export const logReducer = logSlice.reducer;
