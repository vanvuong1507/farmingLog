import {logActions, logReducer} from '../src/features/logs/store/logSlice';

const sampleLog = {
  id: '1',
  activityName: 'Seeding',
  date: '2026-04-17',
  status: 'pending' as const,
  syncStatus: 'pending' as const,
  updatedAt: Date.now(),
  syncRetryCount: 0,
  syncNextAttemptAt: 0,
};

describe('logSlice', () => {
  it('sets logs on load success', () => {
    const state = logReducer(undefined, logActions.loadLogsSuccess([sampleLog]));

    expect(state.items).toHaveLength(1);
    expect(state.listLoading).toBe(false);
  });

  it('tracks list vs persist loading separately', () => {
    let state = logReducer(undefined, logActions.loadLogsRequest());
    expect(state.listLoading).toBe(true);
    expect(state.persistLoading).toBe(false);

    state = logReducer(state, logActions.loadLogsSuccess([]));
    state = logReducer(
      state,
      logActions.addLogRequest({
        activityName: 'X',
        date: '2026-01-01',
        status: 'pending',
      }),
    );
    expect(state.persistLoading).toBe(true);
    expect(state.listLoading).toBe(false);
  });

  it('marks persist success for navigation', () => {
    let state = logReducer(
      undefined,
      logActions.addLogRequest({
        activityName: 'X',
        date: '2026-01-01',
        status: 'pending',
      }),
    );
    state = logReducer(state, logActions.persistLogSuccess());
    expect(state.persistLoading).toBe(false);
    expect(state.persistJustSucceeded).toBe(true);

    state = logReducer(state, logActions.acknowledgePersistSuccess());
    expect(state.persistJustSucceeded).toBe(false);
  });

  it('records persist failure without touching list error', () => {
    let state = logReducer(undefined, logActions.loadLogsFailure('db down'));
    expect(state.error).toBe('db down');

    state = logReducer(
      state,
      logActions.addLogRequest({
        activityName: 'X',
        date: '2026-01-01',
        status: 'pending',
      }),
    );
    state = logReducer(state, logActions.persistLogFailure('constraint'));
    expect(state.persistError).toBe('constraint');
    expect(state.error).toBe('db down');
  });

  it('tracks sync lifecycle flags', () => {
    let state = logReducer(undefined, logActions.triggerSync());
    expect(state.syncing).toBe(true);

    state = logReducer(state, logActions.syncDone());
    expect(state.syncing).toBe(false);
  });

  it('editLogRequest mirrors addLogRequest persist flags', () => {
    let state = logReducer(undefined, logActions.triggerSync());
    state = logReducer(
      state,
      logActions.editLogRequest({
        id: 'x',
        input: {
          activityName: 'E',
          date: '2026-01-01',
          status: 'pending',
        },
      }),
    );
    expect(state.persistLoading).toBe(true);
    expect(state.persistJustSucceeded).toBe(false);
    expect(state.persistError).toBeUndefined();
  });

  it('resetPersistFormState clears persist error and success flag', () => {
    let state = logReducer(undefined, logActions.persistLogFailure('x'));
    state = logReducer(state, logActions.persistLogSuccess());
    state = logReducer(state, logActions.resetPersistFormState());
    expect(state.persistError).toBeUndefined();
    expect(state.persistJustSucceeded).toBe(false);
  });

  it('loadLogsRequest clears previous list error', () => {
    let state = logReducer(undefined, logActions.loadLogsFailure('old'));
    state = logReducer(state, logActions.loadLogsRequest());
    expect(state.error).toBeUndefined();
    expect(state.listLoading).toBe(true);
  });
});
