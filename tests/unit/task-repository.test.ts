import { describe, expect, it } from 'vitest';
import {
  createTaskRepository,
  TASK_STORAGE_KEY,
} from '../../src/lib/task-repository';
import { makeTask, makeWorkspace } from './fixtures';
import { MemoryStorage } from './test-helpers';

describe('task repository', () => {
  it('returns a default workspace when nothing has been saved', () => {
    const result = createTaskRepository(new MemoryStorage()).read();
    expect(result).toMatchObject({
      ok: true,
      value: { version: 2, tasks: [], preferences: { theme: 'light', sort: 'manual' } },
    });
  });

  it('writes and reads a versioned workspace', () => {
    const task = makeTask();
    const workspace = makeWorkspace([task]);
    const repository = createTaskRepository(new MemoryStorage());
    expect(repository.write(workspace)).toEqual({ ok: true, value: undefined });
    expect(repository.read()).toEqual({ ok: true, value: workspace });
    expect(repository.readTasks()).toEqual({ ok: true, value: [task] });
  });

  it('reports malformed reads and invalid writes without overwriting stored bytes', () => {
    const storage = new MemoryStorage();
    const malformed = '{"version":2,"tasks":[{"bad":true}]}';
    storage.data.set(TASK_STORAGE_KEY, malformed);
    const repository = createTaskRepository(storage);

    expect(repository.read().ok).toBe(false);
    expect(repository.write({ ...makeWorkspace(), version: 3 } as never).ok).toBe(false);
    expect(storage.data.get(TASK_STORAGE_KEY)).toBe(malformed);
  });

  it('reports read and write failures', () => {
    const storage = new MemoryStorage();
    const repository = createTaskRepository(storage);
    storage.failReads = true;
    expect(repository.read()).toMatchObject({ ok: false, error: expect.stringContaining('left unchanged') });
    storage.failReads = false;
    storage.failWrites = true;
    expect(repository.write(makeWorkspace())).toMatchObject({
      ok: false,
      error: expect.stringContaining('could not be saved'),
    });
  });
});
