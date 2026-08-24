export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFactoryOptions {
  id?: () => string;
  now?: () => string;
}

export class TaskValidationError extends Error {
  constructor(message = 'Enter a task before adding it.') {
    super(message);
    this.name = 'TaskValidationError';
  }
}

export function normalizeTaskText(text: string): string {
  const normalized = text.trim();
  if (!normalized) {
    throw new TaskValidationError();
  }
  return normalized;
}

export function createTask(text: string, options: TaskFactoryOptions = {}): Task {
  const now = options.now?.() ?? new Date().toISOString();
  const id = options.id?.() ?? crypto.randomUUID();

  return {
    id,
    text: normalizeTaskText(text),
    completed: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function isTask(value: unknown): value is Task {
  if (!value || typeof value !== 'object') return false;
  const task = value as Record<string, unknown>;
  return (
    typeof task.id === 'string' &&
    task.id.length > 0 &&
    typeof task.text === 'string' &&
    task.text.trim().length > 0 &&
    typeof task.completed === 'boolean' &&
    typeof task.createdAt === 'string' &&
    typeof task.updatedAt === 'string'
  );
}
