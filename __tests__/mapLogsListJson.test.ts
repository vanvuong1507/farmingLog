/**
 * @jest-environment node
 */
import {mapLogsListJsonToLogs} from '../src/data/api/logs/mapLogsListJson';

describe('mapLogsListJsonToLogs', () => {
  it('maps valid fixture shape', () => {
    const logs = mapLogsListJsonToLogs({
      version: '1',
      items: [
        {
          id: 'a',
          activityName: 'T',
          date: '2026-04-01',
          status: 'completed',
          syncStatus: 'synced',
          updatedAt: 10,
        },
      ],
    });
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      id: 'a',
      activityName: 'T',
      syncRetryCount: 0,
      syncNextAttemptAt: 0,
    });
  });

  it('returns empty for bad items array', () => {
    expect(mapLogsListJsonToLogs({items: 'nope' as unknown as []})).toEqual([]);
    expect(mapLogsListJsonToLogs({})).toEqual([]);
  });

  it('skips invalid rows', () => {
    expect(
      mapLogsListJsonToLogs({
        items: [{id: 1}, null, {id: 'ok', activityName: 'x', date: 'd', status: 'pending', syncStatus: 'synced', updatedAt: 1}],
      }),
    ).toHaveLength(1);
  });

  it('maps optional string notes and drops non-string notes', () => {
    const [withNotes] = mapLogsListJsonToLogs({
      items: [
        {
          id: 'n1',
          activityName: 'A',
          date: '2026-04-01',
          notes: 'hello',
          status: 'pending',
          syncStatus: 'pending',
          updatedAt: 1,
        },
      ],
    });
    expect(withNotes.notes).toBe('hello');

    const [noNotes] = mapLogsListJsonToLogs({
      items: [
        {
          id: 'n2',
          activityName: 'A',
          date: '2026-04-01',
          notes: 99,
          status: 'pending',
          syncStatus: 'pending',
          updatedAt: 1,
        },
      ],
    });
    expect(noNotes.notes).toBeUndefined();
  });

  it('rejects invalid status or syncStatus or updatedAt type', () => {
    expect(
      mapLogsListJsonToLogs({
        items: [
          {
            id: 's1',
            activityName: 'A',
            date: '2026-04-01',
            status: 'done',
            syncStatus: 'pending',
            updatedAt: 1,
          },
        ],
      }),
    ).toHaveLength(0);
    expect(
      mapLogsListJsonToLogs({
        items: [
          {
            id: 's2',
            activityName: 'A',
            date: '2026-04-01',
            status: 'pending',
            syncStatus: 'unknown',
            updatedAt: 1,
          },
        ],
      }),
    ).toHaveLength(0);
    expect(
      mapLogsListJsonToLogs({
        items: [
          {
            id: 's3',
            activityName: 'A',
            date: '2026-04-01',
            status: 'pending',
            syncStatus: 'pending',
            updatedAt: '1',
          },
        ],
      }),
    ).toHaveLength(0);
  });
});
