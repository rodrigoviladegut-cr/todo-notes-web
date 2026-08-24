import { describe, expect, it } from 'vitest';
import {
  createTask,
  normalizeTaskText,
  TaskValidationError,
} from '../../src/lib/task-model';

describe('task model', () => {
  it('creates an incomplete task with normalized text', () => {
    const task = createTask('  Draft the outline  ', {
      id: () => 'task-1',
      now: () => '2026-08-24T10:00:00.000Z',
    });

    expect(task).toEqual({
      id: 'task-1',
      text: 'Draft the outline',
      completed: false,
      createdAt: '2026-08-24T10:00:00.000Z',
      updatedAt: '2026-08-24T10:00:00.000Z',
    });
  });

  it('rejects empty and whitespace-only text', () => {
    expect(() => normalizeTaskText('   ')).toThrow(TaskValidationError);
    expect(() => createTask('')).toThrow('Enter a task before adding it.');
  });
});
