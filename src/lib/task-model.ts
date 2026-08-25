export type Priority = 'low' | 'medium' | 'high';
export type RecurrenceFrequency = 'none' | 'daily' | 'weekly' | 'monthly';
export type Theme = 'light' | 'dark';
export type TaskSort = 'manual' | 'due-date' | 'priority';
export type TaskView = 'all' | 'today' | 'upcoming';
export type TaskFilter = 'all' | 'active' | 'completed' | 'overdue';

export interface Recurrence {
  frequency: RecurrenceFrequency;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  manualOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  /** @deprecated Use `title`. Retained for the version-1 UI contract. */
  text: string;
  description: string;
  completed: boolean;
  priority: Priority;
  dueDate: string | null;
  category: string | null;
  tags: string[];
  subtasks: Subtask[];
  recurrence: Recurrence | null;
  recurrenceSeriesId: string | null;
  recurrenceSourceId: string | null;
  parentAutoComplete: boolean;
  manualOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  theme: Theme;
  sort: TaskSort;
  view: TaskView;
  filter: TaskFilter;
  search: string;
  showCompletedToday: boolean;
  manualTaskOrder: string[];
}

export interface Workspace {
  version: 2;
  tasks: Task[];
  preferences: UserPreferences;
}

export interface TaskFactoryOptions {
  id?: () => string;
  now?: () => string;
  today?: () => string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: string | null;
  category?: string | null;
  tags?: string[];
  subtasks?: Subtask[];
  recurrence?: Recurrence | null;
  parentAutoComplete?: boolean;
}

export type TaskUpdate = Partial<
  Pick<
    Task,
    | 'title'
    | 'description'
    | 'priority'
    | 'dueDate'
    | 'category'
    | 'tags'
    | 'recurrence'
    | 'parentAutoComplete'
  >
>;

export class TaskValidationError extends Error {
  constructor(message = 'Enter a task before adding it.') {
    super(message);
    this.name = 'TaskValidationError';
  }
}

export function normalizeTaskTitle(title: string): string {
  const normalized = title.trim();
  if (!normalized) throw new TaskValidationError();
  return normalized;
}

/** @deprecated Use `normalizeTaskTitle`. */
export const normalizeTaskText = normalizeTaskTitle;

export function normalizeCategory(category: string | null): string | null {
  if (category === null) return null;
  const normalized = category.trim();
  if (!normalized) throw new TaskValidationError('Category cannot be empty.');
  return normalized;
}

export function normalizeTags(tags: readonly string[]): string[] {
  const normalized: string[] = [];
  const seen = new Set<string>();
  for (const tag of tags) {
    const trimmed = tag.trim();
    if (!trimmed) throw new TaskValidationError('Tags cannot be empty.');
    const key = trimmed.toLocaleLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      normalized.push(trimmed);
    }
  }
  return normalized;
}

export function isLocalDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function toLocalDate(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function compareLocalDates(left: string, right: string): number {
  if (!isLocalDate(left) || !isLocalDate(right)) {
    throw new TaskValidationError('Expected a valid local calendar date.');
  }
  return left.localeCompare(right);
}

export function isOverdue(task: Pick<Task, 'completed' | 'dueDate'>, today = toLocalDate(new Date())): boolean {
  if (!isLocalDate(today)) throw new TaskValidationError('Expected a valid local calendar date.');
  return !task.completed && task.dueDate !== null && isLocalDate(task.dueDate) && task.dueDate < today;
}

export function createTask(
  input: string | CreateTaskInput,
  options: TaskFactoryOptions = {},
  manualOrder = 0,
): Task {
  const details: CreateTaskInput = typeof input === 'string' ? { title: input } : input;
  const now = options.now?.() ?? new Date().toISOString();
  const title = normalizeTaskTitle(details.title);
  const dueDate = details.dueDate ?? null;
  const recurrence = details.recurrence?.frequency === 'none' ? null : (details.recurrence ?? null);
  if (details.description !== undefined && typeof details.description !== 'string') {
    throw new TaskValidationError('Description must be text.');
  }
  if (details.priority !== undefined && !['low', 'medium', 'high'].includes(details.priority)) {
    throw new TaskValidationError('Priority must be low, medium, or high.');
  }
  if (dueDate !== null && !isLocalDate(dueDate)) {
    throw new TaskValidationError('Due date must use YYYY-MM-DD.');
  }
  if (recurrence !== null && dueDate === null) {
    throw new TaskValidationError('Recurring tasks require a due date.');
  }
  if (recurrence !== null && !['daily', 'weekly', 'monthly'].includes(recurrence.frequency)) {
    throw new TaskValidationError('Recurrence must be daily, weekly, or monthly.');
  }
  if (details.subtasks !== undefined &&
    (!Array.isArray(details.subtasks) || !details.subtasks.every(isSubtask))) {
    throw new TaskValidationError('Subtasks are invalid.');
  }

  return {
    id: options.id?.() ?? crypto.randomUUID(),
    title,
    text: title,
    description: details.description ?? '',
    completed: false,
    priority: details.priority ?? 'medium',
    dueDate,
    category: normalizeCategory(details.category ?? null),
    tags: normalizeTags(details.tags ?? []),
    subtasks: (details.subtasks ?? []).map((subtask) => ({ ...subtask })),
    recurrence,
    recurrenceSeriesId: null,
    recurrenceSourceId: null,
    parentAutoComplete: details.parentAutoComplete ?? false,
    manualOrder,
    createdAt: now,
    updatedAt: now,
  };
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isSubtask(value: unknown): value is Subtask {
  if (!value || typeof value !== 'object') return false;
  const subtask = value as Record<string, unknown>;
  return (
    isNonEmptyString(subtask.id) &&
    isNonEmptyString(subtask.title) &&
    typeof subtask.completed === 'boolean' &&
    typeof subtask.manualOrder === 'number' && Number.isFinite(subtask.manualOrder) &&
    isNonEmptyString(subtask.createdAt) &&
    isNonEmptyString(subtask.updatedAt)
  );
}

export function isTask(value: unknown): value is Task {
  if (!value || typeof value !== 'object') return false;
  const task = value as Record<string, unknown>;
  const title = task.title;
  return (
    isNonEmptyString(task.id) &&
    isNonEmptyString(title) &&
    (task.text === undefined || task.text === title) &&
    typeof task.description === 'string' &&
    typeof task.completed === 'boolean' &&
    (task.priority === 'low' || task.priority === 'medium' || task.priority === 'high') &&
    (task.dueDate === null || isLocalDate(task.dueDate)) &&
    (task.category === null || isNonEmptyString(task.category)) &&
    Array.isArray(task.tags) && task.tags.every(isNonEmptyString) &&
    Array.isArray(task.subtasks) && task.subtasks.every(isSubtask) &&
    (task.recurrence === null ||
      (typeof task.recurrence === 'object' && task.recurrence !== null &&
        ['daily', 'weekly', 'monthly'].includes((task.recurrence as Record<string, unknown>).frequency as string))) &&
    !(task.recurrence !== null && task.dueDate === null) &&
    (task.recurrenceSeriesId === null || isNonEmptyString(task.recurrenceSeriesId)) &&
    (task.recurrenceSourceId === null || isNonEmptyString(task.recurrenceSourceId)) &&
    typeof task.parentAutoComplete === 'boolean' &&
    typeof task.manualOrder === 'number' && Number.isFinite(task.manualOrder) &&
    isNonEmptyString(task.createdAt) &&
    isNonEmptyString(task.updatedAt)
  );
}

export function withTaskTextAlias(task: Omit<Task, 'text'> & { text?: string }): Task {
  return { ...task, text: task.title };
}
