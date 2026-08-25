import { describe, expect, it } from 'vitest';
import { calculateSubtaskProgress, calculateTaskStatistics } from '../../src/lib/task-statistics';
import { makeTask } from './fixtures';

describe('task statistics', () => {
  it('returns zero-safe statistics for an empty workspace', () => {
    expect(calculateTaskStatistics([], '2026-08-24')).toEqual({
      total: 0, completed: 0, active: 0, overdue: 0, completionPercentage: 0,
    });
  });

  it('uses the full task collection and excludes completed tasks from overdue', () => {
    const result = calculateTaskStatistics([
      makeTask({ id: 'a', dueDate: '2026-08-23' }),
      makeTask({ id: 'b', completed: true, dueDate: '2026-08-22' }),
      makeTask({ id: 'c', dueDate: null }),
      makeTask({ id: 'd', completed: true }),
    ], '2026-08-24');
    expect(result).toEqual({ total: 4, completed: 2, active: 2, overdue: 1, completionPercentage: 50 });
  });

  it('calculates subtask progress', () => {
    expect(calculateSubtaskProgress([
      { id: '1', title: 'One', completed: true, manualOrder: 0, createdAt: 'now', updatedAt: 'now' },
      { id: '2', title: 'Two', completed: false, manualOrder: 1, createdAt: 'now', updatedAt: 'now' },
    ])).toEqual({ total: 2, completed: 1, percentage: 50 });
  });
});
