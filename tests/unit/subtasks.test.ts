import { describe, expect, it } from 'vitest';
import { createTaskRepository } from '../../src/lib/task-repository';
import { createTaskStore } from '../../src/lib/task-store';
import { MemoryStorage } from './test-helpers';

function setup() {
  let id = 0;
  let tick = 0;
  const store = createTaskStore(createTaskRepository(new MemoryStorage()), {
    id: () => `id-${++id}`,
    now: () => `2026-08-24T10:00:${String(tick++).padStart(2, '0')}.000Z`,
    today: () => '2026-08-24',
  });
  store.load();
  const task = store.add('Parent');
  return { store, task };
}

describe('subtask transitions', () => {
  it('adds, edits, reorders, toggles, removes, and reports progress', () => {
    const { store, task } = setup();
    const first = store.addSubtask(task.id, ' First ');
    const second = store.addSubtask(task.id, 'Second');
    store.editSubtask(task.id, second.id, 'Updated');
    store.reorderSubtasks(task.id, [second.id, first.id]);
    store.toggleSubtask(task.id, first.id);

    expect(store.tasks[0].subtasks.map((item) => [item.title, item.manualOrder]))
      .toEqual([['Updated', 0], ['First', 1]]);
    expect(store.subtaskProgress(task.id)).toEqual({ total: 2, completed: 1, percentage: 50 });
    expect(store.tasks[0].completed).toBe(false);

    store.removeSubtask(task.id, second.id);
    expect(store.tasks[0].subtasks).toHaveLength(1);
    expect(store.tasks[0].subtasks[0].manualOrder).toBe(0);
  });

  it('only auto-completes the parent when explicitly enabled', () => {
    const { store, task } = setup();
    const first = store.addSubtask(task.id, 'First');
    const second = store.addSubtask(task.id, 'Second');
    store.toggleSubtask(task.id, first.id);
    store.toggleSubtask(task.id, second.id);
    expect(store.tasks[0].completed).toBe(false);

    store.toggleSubtask(task.id, second.id);
    store.edit(task.id, { parentAutoComplete: true });
    store.toggleSubtask(task.id, second.id);
    expect(store.tasks[0].completed).toBe(true);
  });

  it('rejects empty edits without changing prior subtask data', () => {
    const { store, task } = setup();
    const subtask = store.addSubtask(task.id, 'Keep me');
    expect(() => store.editSubtask(task.id, subtask.id, '   ')).toThrow();
    expect(store.tasks[0].subtasks[0].title).toBe('Keep me');
  });
});
