import { createTask, type Task, type Workspace } from '../../src/lib/task-model';
import { createDefaultPreferences } from '../../src/lib/task-preferences';

export function makeTask(overrides: Partial<Task> = {}): Task {
  const base = createTask(overrides.title ?? overrides.text ?? 'Task', {
    id: () => overrides.id ?? 'task-1',
    now: () => overrides.createdAt ?? '2026-08-24T10:00:00.000Z',
  });
  const title = overrides.title ?? overrides.text ?? base.title;
  return {
    ...base,
    ...overrides,
    title,
    text: title,
    tags: [...(overrides.tags ?? base.tags)],
    subtasks: (overrides.subtasks ?? base.subtasks).map((subtask) => ({ ...subtask })),
    updatedAt: overrides.updatedAt ?? base.updatedAt,
  };
}

export function makeWorkspace(tasks: Task[] = []): Workspace {
  return {
    version: 2,
    tasks,
    preferences: createDefaultPreferences(tasks.map((task) => task.id)),
  };
}
