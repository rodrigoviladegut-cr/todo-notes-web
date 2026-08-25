import { describe, expect, it } from 'vitest';
import { createTaskRepository } from '../../src/lib/task-repository';
import { createTaskStore } from '../../src/lib/task-store';
import { MemoryStorage } from './test-helpers';

function setup() {
  const storage = new MemoryStorage();
  let tick = 0;
  const store = createTaskStore(createTaskRepository(storage), {
    id: () => 'task-1',
    now: () => `2026-08-24T10:00:0${tick++}.000Z`,
    today: () => '2026-08-24',
  });
  store.load();
  return { storage, store };
}

describe('task store', () => {
  it('creates a task and exposes it immediately', () => {
    const { store } = setup();
    store.add('  Plan the day  ');

    expect(store.tasks).toHaveLength(1);
    expect(store.tasks[0]).toMatchObject({ text: 'Plan the day', completed: false });
    expect(store.status).toBe('ready');
  });

  it('completes and reopens a task while updating its timestamp', () => {
    const { store } = setup();
    store.add('Plan the day');
    const createdAt = store.tasks[0].updatedAt;

    store.toggle('task-1');
    expect(store.tasks[0].completed).toBe(true);
    expect(store.tasks[0].updatedAt).not.toBe(createdAt);

    store.toggle('task-1');
    expect(store.tasks[0].completed).toBe(false);
  });

  it('edits text without changing completion and deletes the task', () => {
    const { store } = setup();
    store.add('Plan the day');
    store.toggle('task-1');

    store.edit('task-1', '  Plan tomorrow  ');
    expect(store.tasks[0]).toMatchObject({ text: 'Plan tomorrow', completed: true });

    store.remove('task-1');
    expect(store.tasks).toEqual([]);
  });

  it('keeps the changed in-memory state when persistence fails', () => {
    const { storage, store } = setup();
    storage.failWrites = true;

    store.add('Unsaved but visible');

    expect(store.tasks[0].text).toBe('Unsaved but visible');
    expect(store.status).toBe('error');
    expect(store.message).toContain('could not be saved');
  });

  it('persists rich task details and their edits across reloads', () => {
    const { storage, store } = setup();
    store.add({
      title: 'Plan launch',
      description: 'Draft the release brief',
      priority: 'high',
      dueDate: '2026-08-28',
      category: 'Work',
      tags: ['Launch', 'Writing'],
    });
    store.edit('task-1', {
      description: 'Publish the release brief',
      priority: 'low',
      dueDate: '2026-08-29',
      category: 'Planning',
      tags: ['Published'],
    });

    const reloaded = createTaskStore(createTaskRepository(storage));
    reloaded.load();

    expect(reloaded.tasks[0]).toMatchObject({
      title: 'Plan launch',
      description: 'Publish the release brief',
      priority: 'low',
      dueDate: '2026-08-29',
      category: 'Planning',
      tags: ['Published'],
    });
  });

  it('rejects recurrence updates without a due date and preserves recurring state on invalid date removal', () => {
    const { store } = setup();
    const undated = store.add('Undated');
    expect(() => store.edit(undated.id, { recurrence: { frequency: 'weekly' } }))
      .toThrow('Recurring tasks require a due date.');
    expect(store.tasks[0].recurrence).toBeNull();

    store.edit(undated.id, { dueDate: '2026-08-30', recurrence: { frequency: 'weekly' } });
    expect(() => store.edit(undated.id, { dueDate: null }))
      .toThrow('Recurring tasks require a due date.');
    expect(store.tasks[0]).toMatchObject({
      dueDate: '2026-08-30',
      recurrence: { frequency: 'weekly' },
    });
  });

  it('copies recurring task details once and resets the next occurrence', () => {
    let id = 0;
    const store = createTaskStore(createTaskRepository(new MemoryStorage()), {
      id: () => `generated-${++id}`,
      now: () => '2026-08-24T10:00:00.000Z',
      today: () => '2026-08-24',
    });
    store.load();
    const task = store.add({
      title: 'Review metrics',
      description: 'Use dashboard',
      priority: 'high',
      dueDate: '2026-08-20',
      category: 'Work',
      tags: ['Review'],
      recurrence: { frequency: 'daily' },
      parentAutoComplete: true,
    });
    const subtask = store.addSubtask(task.id, 'Open dashboard');
    store.toggleSubtask(task.id, subtask.id);

    expect(store.tasks).toHaveLength(2);
    const source = store.tasks.find((item) => item.id === task.id)!;
    const next = store.tasks.find((item) => item.recurrenceSourceId === task.id)!;
    expect(source.completed).toBe(true);
    expect(next).toMatchObject({
      title: 'Review metrics',
      description: 'Use dashboard',
      priority: 'high',
      dueDate: '2026-08-25',
      category: 'Work',
      tags: ['Review'],
      completed: false,
      recurrenceSeriesId: task.id,
    });
    expect(next.subtasks[0]).toMatchObject({ title: 'Open dashboard', completed: false });
    expect(store.statistics).toEqual({
      total: 2, completed: 1, active: 1, overdue: 0, completionPercentage: 50,
    });

    store.toggle(task.id);
    store.toggle(task.id);
    expect(store.tasks.filter((item) => item.recurrenceSourceId === task.id)).toHaveLength(1);
  });

  it('reorders only visible manual-order slots and exposes derived snapshots', () => {
    const { store } = setup();
    const first = store.add('Show first');
    const hidden = store.add('Hidden');
    const last = store.add('Show last');
    store.updatePreferences({ search: 'show' });
    store.reorderVisible([last.id, first.id]);

    expect(store.preferences.manualTaskOrder).toEqual([last.id, hidden.id, first.id]);
    const snapshot = store.snapshot();
    expect(snapshot.visibleTasks.map((task) => task.id)).toEqual([last.id, first.id]);
    expect(snapshot.statistics).toMatchObject({ total: 3, active: 3 });
  });

  it('updates full-collection statistics through create, complete, reopen, and delete transitions', () => {
    const { store } = setup();
    const task = store.add({ title: 'Overdue', dueDate: '2026-08-23' });
    expect(store.statistics).toEqual({
      total: 1, completed: 0, active: 1, overdue: 1, completionPercentage: 0,
    });

    store.toggle(task.id);
    expect(store.statistics).toEqual({
      total: 1, completed: 1, active: 0, overdue: 0, completionPercentage: 100,
    });

    store.toggle(task.id);
    expect(store.statistics).toEqual({
      total: 1, completed: 0, active: 1, overdue: 1, completionPercentage: 0,
    });

    store.remove(task.id);
    expect(store.statistics).toEqual({
      total: 0, completed: 0, active: 0, overdue: 0, completionPercentage: 0,
    });
  });
});
