import { describe, expect, it } from 'vitest';
import {
  createTaskRepository,
  TASK_STORAGE_KEY,
} from '../../src/lib/task-repository';
import type { Task } from '../../src/lib/task-model';
import { MemoryStorage } from './test-helpers';

const task: Task = {
  id: 'task-1',
  text: 'Write tests',
  completed: false,
  createdAt: '2026-08-24T10:00:00.000Z',
  updatedAt: '2026-08-24T10:00:00.000Z',
};

describe('task repository', () => {
  it('returns an empty list when no tasks have been saved', () => {
    expect(createTaskRepository(new MemoryStorage()).read()).toEqual({ ok: true, value: [] });
  });

  it('writes and reads a versioned task list', () => {
    const repository = createTaskRepository(new MemoryStorage());
    expect(repository.write([task])).toEqual({ ok: true, value: undefined });
    expect(repository.read()).toEqual({ ok: true, value: [task] });
  });

  it('reports malformed data without overwriting it', () => {
    const storage = new MemoryStorage();
    storage.data.set(TASK_STORAGE_KEY, '{"version":1,"tasks":[{"bad":true}]}');

    const result = createTaskRepository(storage).read();

    expect(result.ok).toBe(false);
    expect(storage.data.get(TASK_STORAGE_KEY)).toContain('"bad":true');
  });

  it('reports read and write failures', () => {
    const storage = new MemoryStorage();
    const repository = createTaskRepository(storage);
    storage.failReads = true;
    expect(repository.read().ok).toBe(false);
    storage.failReads = false;
    storage.failWrites = true;
    expect(repository.write([task]).ok).toBe(false);
  });
});
