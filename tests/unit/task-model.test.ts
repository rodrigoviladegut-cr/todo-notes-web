import { describe, expect, it } from 'vitest';
import {
  compareLocalDates,
  createTask,
  isLocalDate,
  isOverdue,
  normalizeTags,
  normalizeTaskText,
  TaskValidationError,
  toLocalDate,
} from '../../src/lib/task-model';

describe('task model', () => {
  it('creates a title-only task with expanded defaults and the legacy text alias', () => {
    const task = createTask('  Draft the outline  ', {
      id: () => 'task-1',
      now: () => '2026-08-24T10:00:00.000Z',
    });

    expect(task).toMatchObject({
      id: 'task-1',
      title: 'Draft the outline',
      text: 'Draft the outline',
      description: '',
      completed: false,
      priority: 'medium',
      dueDate: null,
      category: null,
      tags: [],
      subtasks: [],
      recurrence: null,
      parentAutoComplete: false,
      manualOrder: 0,
    });
  });

  it('normalizes category and tags and rejects invalid rich values', () => {
    const task = createTask({
      title: 'Organize',
      dueDate: '2026-08-25',
      category: ' Work ',
      tags: [' Focus ', 'focus', 'Today'],
      recurrence: { frequency: 'daily' },
    });
    expect(task.category).toBe('Work');
    expect(task.tags).toEqual(['Focus', 'Today']);
    expect(() => normalizeTags(['ok', ' '])).toThrow('Tags cannot be empty.');
    expect(() => createTask({ title: 'No date', recurrence: { frequency: 'weekly' } })).toThrow(
      'Recurring tasks require a due date.',
    );
  });

  it('clones caller-owned subtask objects', () => {
    const subtask = {
      id: 'subtask-1',
      title: 'Draft section',
      completed: false,
      manualOrder: 0,
      createdAt: '2026-08-24T10:00:00.000Z',
      updatedAt: '2026-08-24T10:00:00.000Z',
    };

    const task = createTask({ title: 'Write report', subtasks: [subtask] });
    subtask.title = 'Caller mutation';
    subtask.completed = true;

    expect(task.subtasks[0]).toMatchObject({ title: 'Draft section', completed: false });
    expect(task.subtasks[0]).not.toBe(subtask);
  });

  it('rejects empty and whitespace-only titles through the backward helper', () => {
    expect(() => normalizeTaskText('   ')).toThrow(TaskValidationError);
    expect(() => createTask('')).toThrow('Enter a task before adding it.');
  });

  it('uses local calendar dates for validation, comparison, and overdue state', () => {
    expect(toLocalDate(new Date(2026, 7, 24, 23, 30))).toBe('2026-08-24');
    expect(isLocalDate('2024-02-29')).toBe(true);
    expect(isLocalDate('2026-02-29')).toBe(false);
    expect(compareLocalDates('2026-08-23', '2026-08-24')).toBeLessThan(0);
    expect(isOverdue({ completed: false, dueDate: '2026-08-23' }, '2026-08-24')).toBe(true);
    expect(isOverdue({ completed: true, dueDate: '2026-08-23' }, '2026-08-24')).toBe(false);
    expect(isOverdue({ completed: false, dueDate: '2026-08-24' }, '2026-08-24')).toBe(false);
  });
});
