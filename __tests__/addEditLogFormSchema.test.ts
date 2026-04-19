/**
 * @jest-environment node
 */
import {createAddEditLogFormSchema} from '../src/features/logs/addEditLogFormSchema';

const t = (key: string) => key;

describe('createAddEditLogFormSchema', () => {
  const schema = createAddEditLogFormSchema(t);

  it('accepts valid payload with optional empty notes', () => {
    const r = schema.safeParse({
      activityName: 'Harvest',
      date: '2026-04-19',
      notes: '',
      status: 'completed',
    });
    expect(r.success).toBe(true);
  });

  it('trims activity name', () => {
    const r = schema.safeParse({
      activityName: '  Seed  ',
      date: '2026-01-15',
      notes: 'ok',
      status: 'pending',
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.activityName).toBe('Seed');
    }
  });

  it('rejects empty activity name', () => {
    const r = schema.safeParse({
      activityName: '   ',
      date: '2026-01-01',
      notes: 'x',
      status: 'pending',
    });
    expect(r.success).toBe(false);
  });

  it('rejects invalid date format', () => {
    const r = schema.safeParse({
      activityName: 'A',
      date: '19/04/2026',
      notes: '',
      status: 'pending',
    });
    expect(r.success).toBe(false);
  });

  it('rejects invalid status literal', () => {
    const r = schema.safeParse({
      activityName: 'A',
      date: '2026-01-01',
      notes: '',
      status: 'unknown',
    });
    expect(r.success).toBe(false);
  });

  it('trims date string before validating ISO', () => {
    const r = schema.safeParse({
      activityName: 'A',
      date: '  2020-12-31  ',
      notes: '',
      status: 'pending',
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.date).toBe('2020-12-31');
    }
  });

  it('accepts leap-day dates', () => {
    const r = schema.safeParse({
      activityName: 'A',
      date: '2024-02-29',
      notes: '',
      status: 'pending',
    });
    expect(r.success).toBe(true);
  });
});
