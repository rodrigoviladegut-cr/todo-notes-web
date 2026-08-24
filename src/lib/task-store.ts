import {
  createTask,
  normalizeTaskText,
  type Task,
  type TaskFactoryOptions,
} from './task-model';
import type { TaskRepository } from './task-repository';

export type TaskStoreStatus = 'loading' | 'ready' | 'error';

export interface TaskStoreSnapshot {
  tasks: Task[];
  status: TaskStoreStatus;
  message: string;
}

export interface TaskStore extends TaskStoreSnapshot {
  load(): void;
  add(text: string): void;
  toggle(id: string): void;
  edit(id: string, text: string): void;
  remove(id: string): void;
  clearMessage(): void;
  snapshot(): TaskStoreSnapshot;
}

export function createTaskStore(
  repository: TaskRepository,
  options: TaskFactoryOptions = {},
): TaskStore {
  let tasks: Task[] = [];
  let status: TaskStoreStatus = 'loading';
  let message = '';

  const currentTime = () => options.now?.() ?? new Date().toISOString();

  function persist(nextTasks: Task[]) {
    tasks = nextTasks;
    const result = repository.write(tasks);
    status = result.ok ? 'ready' : 'error';
    message = result.ok ? '' : result.error;
  }

  const store: TaskStore = {
    get tasks() {
      return tasks;
    },
    get status() {
      return status;
    },
    get message() {
      return message;
    },
    load() {
      const result = repository.read();
      if (result.ok) {
        tasks = result.value;
        status = 'ready';
        message = '';
      } else {
        status = 'error';
        message = result.error;
      }
    },
    add(text) {
      persist([...tasks, createTask(text, options)]);
    },
    toggle(id) {
      persist(
        tasks.map((task) =>
          task.id === id
            ? { ...task, completed: !task.completed, updatedAt: currentTime() }
            : task,
        ),
      );
    },
    edit(id, text) {
      const normalized = normalizeTaskText(text);
      persist(
        tasks.map((task) =>
          task.id === id
            ? { ...task, text: normalized, updatedAt: currentTime() }
            : task,
        ),
      );
    },
    remove(id) {
      persist(tasks.filter((task) => task.id !== id));
    },
    clearMessage() {
      message = '';
      if (status === 'error') status = 'ready';
    },
    snapshot() {
      return { tasks: [...tasks], status, message };
    },
  };

  return store;
}
