import type { Task, UserPreferences, Workspace } from './task-model';
import {
  isWorkspace,
  migrateWorkspace,
  requiresWorkspaceMigration,
  WORKSPACE_VERSION,
} from './task-migration';
import { createDefaultPreferences } from './task-preferences';

export const TASK_STORAGE_KEY = 'todo-notes.tasks';
export const STORAGE_VERSION = WORKSPACE_VERSION;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export type RepositoryResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string; value?: T };

export interface TaskRepository {
  read(): RepositoryResult<Workspace>;
  write(workspace: Workspace): RepositoryResult<void>;
  readWorkspace(): RepositoryResult<Workspace>;
  writeWorkspace(workspace: Workspace): RepositoryResult<void>;
  /** Compatibility helper for consumers that only need tasks. */
  readTasks(): RepositoryResult<Task[]>;
  /** Compatibility helper that writes tasks with supplied or default preferences. */
  writeTasks(tasks: Task[], preferences?: UserPreferences): RepositoryResult<void>;
}

function emptyWorkspace(): Workspace {
  return {
    version: WORKSPACE_VERSION,
    tasks: [],
    preferences: createDefaultPreferences(),
  };
}

export function createTaskRepository(storage: StorageLike): TaskRepository {
  function write(workspace: Workspace): RepositoryResult<void> {
    if (!isWorkspace(workspace)) {
      return {
        ok: false,
        error: 'This workspace is invalid and was not saved. Existing stored data was left unchanged.',
      };
    }
    try {
      storage.setItem(TASK_STORAGE_KEY, JSON.stringify(workspace));
      return { ok: true, value: undefined };
    } catch {
      return {
        ok: false,
        error: 'This change is visible but could not be saved. Check browser storage.',
      };
    }
  }

  function read(): RepositoryResult<Workspace> {
    try {
      const raw = storage.getItem(TASK_STORAGE_KEY);
      if (raw === null) return { ok: true, value: emptyWorkspace() };
      const parsed: unknown = JSON.parse(raw);
      const shouldWriteMigration = requiresWorkspaceMigration(parsed);
      const workspace = migrateWorkspace(parsed);
      if (shouldWriteMigration) {
        const saved = write(workspace);
        if (!saved.ok) {
          return {
            ok: false,
            error: `Saved tasks were valid but could not be upgraded. ${saved.error}`,
            value: workspace,
          };
        }
      }
      return { ok: true, value: workspace };
    } catch {
      return {
        ok: false,
        error: 'Saved workspace could not be read. Your stored data was left unchanged.',
      };
    }
  }

  return {
    read,
    write,
    readWorkspace: read,
    writeWorkspace: write,
    readTasks() {
      const result = read();
      if (result.ok) return { ok: true, value: result.value.tasks };
      return result.value
        ? { ok: false, error: result.error, value: result.value.tasks }
        : { ok: false, error: result.error };
    },
    writeTasks(tasks, preferences = createDefaultPreferences(tasks.map((task) => task.id))) {
      return write({ version: WORKSPACE_VERSION, tasks, preferences });
    },
  };
}
