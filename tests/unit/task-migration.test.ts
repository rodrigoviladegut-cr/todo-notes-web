import { describe, expect, it } from 'vitest';
import { migrateWorkspace, WorkspaceMigrationError } from '../../src/lib/task-migration';
import { createTaskRepository, TASK_STORAGE_KEY } from '../../src/lib/task-repository';
import { createTaskStore } from '../../src/lib/task-store';
import { MemoryStorage } from './test-helpers';

const legacy = {
  version: 1,
  tasks: [
    {
      id: 'old-1',
      text: 'First',
      completed: true,
      createdAt: '2026-08-20T10:00:00.000Z',
      updatedAt: '2026-08-21T10:00:00.000Z',
    },
    {
      id: 'old-2',
      text: 'Second',
      completed: false,
      createdAt: '2026-08-22T10:00:00.000Z',
      updatedAt: '2026-08-22T10:00:00.000Z',
    },
  ],
} as const;

describe('workspace migration', () => {
  it('preserves legacy identity, state, timestamps, and order while adding safe defaults', () => {
    const workspace = migrateWorkspace(legacy);
    expect(workspace.version).toBe(2);
    expect(workspace.preferences.manualTaskOrder).toEqual(['old-1', 'old-2']);
    expect(workspace.tasks[0]).toMatchObject({
      id: 'old-1',
      title: 'First',
      text: 'First',
      completed: true,
      priority: 'medium',
      manualOrder: 0,
      createdAt: '2026-08-20T10:00:00.000Z',
      dueDate: null,
      tags: [],
    });
  });

  it('is idempotent for an already migrated workspace', () => {
    const once = migrateWorkspace(legacy);
    expect(migrateWorkspace(once)).toEqual(once);
  });

  it('persists a valid migration through the repository', () => {
    const storage = new MemoryStorage();
    storage.data.set(TASK_STORAGE_KEY, JSON.stringify(legacy));
    const result = createTaskRepository(storage).read();
    expect(result.ok).toBe(true);
    expect(JSON.parse(storage.data.get(TASK_STORAGE_KEY)!).version).toBe(2);
  });

  it('keeps a valid migration available to the store when write-back fails', () => {
    const storage = new MemoryStorage();
    storage.data.set(TASK_STORAGE_KEY, JSON.stringify(legacy));
    storage.failWrites = true;
    const store = createTaskStore(createTaskRepository(storage));

    store.load();

    expect(store.tasks.map((task) => task.id)).toEqual(['old-1', 'old-2']);
    expect(store.preferences.manualTaskOrder).toEqual(['old-1', 'old-2']);
    expect(store.status).toBe('error');
    expect(store.message).toContain('could not be upgraded');
    expect(JSON.parse(storage.data.get(TASK_STORAGE_KEY)!).version).toBe(1);
  });

  it('rejects a malformed record without partially migrating storage', () => {
    const malformed = { version: 1, tasks: [...legacy.tasks, { id: 'broken' }] };
    expect(() => migrateWorkspace(malformed)).toThrow(WorkspaceMigrationError);
    const storage = new MemoryStorage();
    const raw = JSON.stringify(malformed);
    storage.data.set(TASK_STORAGE_KEY, raw);
    expect(createTaskRepository(storage).read().ok).toBe(false);
    expect(storage.data.get(TASK_STORAGE_KEY)).toBe(raw);
  });
});
