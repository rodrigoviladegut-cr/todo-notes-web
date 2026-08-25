import { describe, expect, it } from 'vitest';
import { advanceRecurrenceToFuture, nextRecurrenceDate } from '../../src/lib/recurrence';

describe('recurrence dates', () => {
  it('calculates daily and weekly local dates', () => {
    expect(nextRecurrenceDate('2026-08-24', { frequency: 'daily' })).toBe('2026-08-25');
    expect(nextRecurrenceDate('2026-08-24', { frequency: 'weekly' })).toBe('2026-08-31');
  });

  it('clamps monthly recurrence to the final valid target-month day', () => {
    expect(nextRecurrenceDate('2026-01-31', { frequency: 'monthly' })).toBe('2026-02-28');
    expect(nextRecurrenceDate('2024-01-31', { frequency: 'monthly' })).toBe('2024-02-29');
  });

  it('skips missed occurrences and returns exactly the next future date', () => {
    expect(advanceRecurrenceToFuture('2026-08-20', { frequency: 'daily' }, '2026-08-24'))
      .toBe('2026-08-25');
    expect(advanceRecurrenceToFuture('2026-08-01', { frequency: 'weekly' }, '2026-08-24'))
      .toBe('2026-08-29');
    expect(advanceRecurrenceToFuture('2026-01-31', { frequency: 'monthly' }, '2026-03-01'))
      .toBe('2026-03-31');
  });
});
