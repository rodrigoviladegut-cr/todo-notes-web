import { isTask, type Task } from './task-model';

export const TASK_STORAGE_KEY = 'todo-notes.tasks';
const STORAGE_VERSION = 1;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export type RepositoryResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

interface StoredTasks {
  version: number;
  tasks: Task[];
}

export interface TaskRepository {
  read(): RepositoryResult<Task[]>;
  write(tasks: Task[]): RepositoryResult<void>;
}

function isStoredTasks(value: unknown): value is StoredTasks {
  if (!value || typeof value !== 'object') return false;
  const data = value as Record<string, unknown>;
  return (
    data.version === STORAGE_VERSION &&
    Array.isArray(data.tasks) &&
    data.tasks.every(isTask)
  );
}

export function createTaskRepository(storage: StorageLike): TaskRepository {
  return {
    read() {
      try {
        const raw = storage.getItem(TASK_STORAGE_KEY);
        if (raw === null) return { ok: true, value: [] };
        const parsed: unknown = JSON.parse(raw);
        if (!isStoredTasks(parsed)) {
          return {
            ok: false,
            error: 'Saved tasks could not be read. Your stored data was left unchanged.',
          };
        }
        return { ok: true, value: parsed.tasks };
      } catch {
        return {
          ok: false,
          error: 'Saved tasks could not be read. Check browser storage and try again.',
        };
      }
    },
    write(tasks) {
      try {
        storage.setItem(
          TASK_STORAGE_KEY,
          JSON.stringify({ version: STORAGE_VERSION, tasks }),
        );
        return { ok: true, value: undefined };
      } catch {
        return {
          ok: false,
          error: 'This change is visible but could not be saved. Check browser storage.',
        };
      }
    },
  };
}
