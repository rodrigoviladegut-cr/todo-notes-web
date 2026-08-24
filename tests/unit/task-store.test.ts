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
});
