import {
  createTask,
  isLocalDate,
  normalizeCategory,
  normalizeTags,
  normalizeTaskTitle,
  TaskValidationError,
  toLocalDate,
  type CreateTaskInput,
  type Subtask,
  type Task,
  type TaskFactoryOptions,
  type TaskUpdate,
  type UserPreferences,
  type Workspace,
} from './task-model';
import { advanceRecurrenceToFuture } from './recurrence';
import { mergeVisibleOrder, queryTasks } from './task-queries';
import { mergePreferences } from './task-preferences';
import type { TaskRepository } from './task-repository';
import {
  calculateSubtaskProgress,
  calculateTaskStatistics,
  type SubtaskProgress,
  type TaskStatistics,
} from './task-statistics';

export type TaskStoreStatus = 'loading' | 'ready' | 'error';

// Optional derived fields allow the existing UI to construct its pre-load placeholder.
export interface TaskStoreSnapshot {
  tasks: Task[];
  status: TaskStoreStatus;
  message: string;
  preferences?: UserPreferences;
  visibleTasks?: Task[];
  statistics?: TaskStatistics;
}

export interface WorkspaceSnapshot extends TaskStoreSnapshot {
  preferences: UserPreferences;
  visibleTasks: Task[];
  statistics: TaskStatistics;
}

export interface TaskStore {
  readonly tasks: Task[];
  readonly preferences: UserPreferences;
  readonly visibleTasks: Task[];
  readonly statistics: TaskStatistics;
  readonly status: TaskStoreStatus;
  readonly message: string;
  load(): void;
  add(input: string | CreateTaskInput): Task;
  toggle(id: string): void;
  edit(id: string, update: string | TaskUpdate): void;
  remove(id: string): void;
  updatePreferences(patch: Partial<UserPreferences>): void;
  setPreferences(patch: Partial<UserPreferences>): void;
  addSubtask(taskId: string, title: string): Subtask;
  editSubtask(taskId: string, subtaskId: string, title: string): void;
  toggleSubtask(taskId: string, subtaskId: string): void;
  removeSubtask(taskId: string, subtaskId: string): void;
  reorderSubtasks(taskId: string, orderedIds: readonly string[]): void;
  subtaskProgress(taskId: string): SubtaskProgress;
  reorderVisible(orderedVisibleIds: readonly string[]): void;
  clearMessage(): void;
  snapshot(): WorkspaceSnapshot;
}

function cloneTask(task: Task): Task {
  return {
    ...task,
    tags: [...task.tags],
    subtasks: task.subtasks.map((subtask) => ({ ...subtask })),
    recurrence: task.recurrence ? { ...task.recurrence } : null,
  };
}

export function createTaskStore(
  repository: TaskRepository,
  options: TaskFactoryOptions = {},
): TaskStore {
  let tasks: Task[] = [];
  let preferences: UserPreferences = {
    theme: 'light',
    sort: 'manual',
    view: 'all',
    filter: 'all',
    search: '',
    showCompletedToday: false,
    manualTaskOrder: [],
  };
  let status: TaskStoreStatus = 'loading';
  let message = '';

  const currentTime = () => options.now?.() ?? new Date().toISOString();
  const currentDate = () => options.today?.() ?? toLocalDate(new Date(currentTime()));

  function makeId(existingIds: readonly string[]): string {
    const candidate = options.id?.() ?? crypto.randomUUID();
    if (!existingIds.includes(candidate)) return candidate;
    let suffix = 2;
    while (existingIds.includes(`${candidate}-${suffix}`)) suffix += 1;
    return `${candidate}-${suffix}`;
  }

  function alignedPreferences(nextTasks: readonly Task[], next: UserPreferences): UserPreferences {
    const taskIds = new Set(nextTasks.map((task) => task.id));
    const order = next.manualTaskOrder.filter((id) => taskIds.has(id));
    for (const task of nextTasks) if (!order.includes(task.id)) order.push(task.id);
    return { ...next, manualTaskOrder: order };
  }

  function persist(nextTasks: Task[], nextPreferences = preferences) {
    const aligned = alignedPreferences(nextTasks, nextPreferences);
    const order = new Map(aligned.manualTaskOrder.map((id, index) => [id, index]));
    tasks = nextTasks.map((task) => ({
      ...task,
      manualOrder: order.get(task.id) ?? task.manualOrder,
    }));
    preferences = aligned;
    const workspace: Workspace = { version: 2, tasks, preferences };
    const result = repository.write(workspace);
    status = result.ok ? 'ready' : 'error';
    message = result.ok ? '' : result.error;
  }

  function taskIndex(id: string): number {
    const index = tasks.findIndex((task) => task.id === id);
    if (index === -1) throw new TaskValidationError('Task was not found.');
    return index;
  }

  function updateTask(task: Task, update: string | TaskUpdate, now: string): Task {
    const patch: TaskUpdate = typeof update === 'string' ? { title: update } : update;
    const title = patch.title === undefined ? task.title : normalizeTaskTitle(patch.title);
    if (patch.description !== undefined && typeof patch.description !== 'string') {
      throw new TaskValidationError('Description must be text.');
    }
    if (patch.priority !== undefined && !['low', 'medium', 'high'].includes(patch.priority)) {
      throw new TaskValidationError('Priority must be low, medium, or high.');
    }
    if (patch.dueDate !== undefined && patch.dueDate !== null && !isLocalDate(patch.dueDate)) {
      throw new TaskValidationError('Due date must use YYYY-MM-DD.');
    }
    if (patch.recurrence !== undefined && patch.recurrence !== null && patch.recurrence.frequency !== 'none' &&
      !['daily', 'weekly', 'monthly'].includes(patch.recurrence.frequency)) {
      throw new TaskValidationError('Recurrence must be daily, weekly, or monthly.');
    }
    const dueDate = patch.dueDate === undefined ? task.dueDate : patch.dueDate;
    let recurrence = patch.recurrence === undefined ? task.recurrence : patch.recurrence;
    if (recurrence?.frequency === 'none') recurrence = null;
    if (recurrence !== null && dueDate === null) {
      throw new TaskValidationError('Recurring tasks require a due date.');
    }

    return {
      ...task,
      ...patch,
      title,
      text: title,
      dueDate,
      recurrence,
      category: patch.category === undefined ? task.category : normalizeCategory(patch.category),
      tags: patch.tags === undefined ? task.tags : normalizeTags(patch.tags),
      updatedAt: now,
    };
  }

  function nextOccurrence(source: Task, allTasks: readonly Task[], now: string): Task {
    const taskId = makeId(allTasks.map((task) => task.id));
    const existingSubtaskIds: string[] = [];
    const subtasks = source.subtasks.map((subtask, manualOrder) => {
      const id = makeId(existingSubtaskIds);
      existingSubtaskIds.push(id);
      return {
        ...subtask,
        id,
        completed: false,
        manualOrder,
        createdAt: now,
        updatedAt: now,
      };
    });
    const seriesId = source.recurrenceSeriesId ?? source.id;
    const monthlyAnchorDay = source.recurrence?.frequency === 'monthly'
      ? Math.max(...allTasks
          .filter((task) => (task.recurrenceSeriesId ?? task.id) === seriesId && task.dueDate !== null)
          .map((task) => Number(task.dueDate!.slice(-2))))
      : undefined;
    return {
      ...cloneTask(source),
      id: taskId,
      completed: false,
      dueDate: advanceRecurrenceToFuture(
        source.dueDate!,
        source.recurrence!,
        currentDate(),
        monthlyAnchorDay,
      ),
      subtasks,
      recurrenceSeriesId: seriesId,
      recurrenceSourceId: source.id,
      manualOrder: allTasks.length,
      createdAt: now,
      updatedAt: now,
    };
  }

  function completeTask(nextTasks: Task[], index: number, now: string): Task[] {
    const original = nextTasks[index];
    const seriesId = original.recurrenceSeriesId ?? (original.recurrence ? original.id : null);
    const completed = { ...original, completed: true, recurrenceSeriesId: seriesId, updatedAt: now };
    nextTasks[index] = completed;
    if (
      completed.recurrence && completed.dueDate &&
      !nextTasks.some((task) => task.recurrenceSourceId === completed.id)
    ) nextTasks.push(nextOccurrence(completed, nextTasks, now));
    return nextTasks;
  }

  function visible(): Task[] {
    return queryTasks(tasks, preferences, currentDate());
  }

  const store: TaskStore = {
    get tasks() {
      return tasks.map(cloneTask);
    },
    get preferences() {
      return { ...preferences, manualTaskOrder: [...preferences.manualTaskOrder] };
    },
    get visibleTasks() {
      return visible().map(cloneTask);
    },
    get statistics() {
      return calculateTaskStatistics(tasks, currentDate());
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
        tasks = result.value.tasks.map(cloneTask);
        preferences = { ...result.value.preferences, manualTaskOrder: [...result.value.preferences.manualTaskOrder] };
        status = 'ready';
        message = '';
      } else if (result.value) {
        tasks = result.value.tasks.map(cloneTask);
        preferences = {
          ...result.value.preferences,
          manualTaskOrder: [...result.value.preferences.manualTaskOrder],
        };
        status = 'error';
        message = result.error;
      } else {
        status = 'error';
        message = result.error;
      }
    },
    add(input) {
      const id = makeId(tasks.map((task) => task.id));
      const task = createTask(input, { ...options, id: () => id }, tasks.length);
      persist([...tasks, task]);
      return cloneTask(task);
    },
    toggle(id) {
      const index = taskIndex(id);
      const now = currentTime();
      const next = [...tasks];
      if (next[index].completed) {
        next[index] = { ...next[index], completed: false, updatedAt: now };
      } else {
        completeTask(next, index, now);
      }
      persist(next);
    },
    edit(id, update) {
      const index = taskIndex(id);
      const next = [...tasks];
      next[index] = updateTask(next[index], update, currentTime());
      persist(next);
    },
    remove(id) {
      taskIndex(id);
      persist(tasks.filter((task) => task.id !== id));
    },
    updatePreferences(patch) {
      const next = mergePreferences(preferences, patch);
      if (patch.manualTaskOrder) {
        const currentIds = new Set(tasks.map((task) => task.id));
        if (patch.manualTaskOrder.length !== tasks.length ||
          patch.manualTaskOrder.some((id) => !currentIds.has(id))) {
          throw new TaskValidationError('Manual order must contain every task exactly once.');
        }
      }
      persist(tasks, next);
    },
    setPreferences(patch) {
      store.updatePreferences(patch);
    },
    addSubtask(taskId, title) {
      const index = taskIndex(taskId);
      const task = tasks[index];
      const now = currentTime();
      const subtask: Subtask = {
        id: makeId(task.subtasks.map((item) => item.id)),
        title: normalizeTaskTitle(title),
        completed: false,
        manualOrder: task.subtasks.length,
        createdAt: now,
        updatedAt: now,
      };
      const next = [...tasks];
      next[index] = { ...task, subtasks: [...task.subtasks, subtask], updatedAt: now };
      persist(next);
      return { ...subtask };
    },
    editSubtask(taskId, subtaskId, title) {
      const index = taskIndex(taskId);
      const task = tasks[index];
      if (!task.subtasks.some((subtask) => subtask.id === subtaskId)) {
        throw new TaskValidationError('Subtask was not found.');
      }
      const now = currentTime();
      const normalized = normalizeTaskTitle(title);
      const next = [...tasks];
      next[index] = {
        ...task,
        subtasks: task.subtasks.map((subtask) => subtask.id === subtaskId
          ? { ...subtask, title: normalized, updatedAt: now }
          : subtask),
        updatedAt: now,
      };
      persist(next);
    },
    toggleSubtask(taskId, subtaskId) {
      const index = taskIndex(taskId);
      const task = tasks[index];
      const subtask = task.subtasks.find((item) => item.id === subtaskId);
      if (!subtask) throw new TaskValidationError('Subtask was not found.');
      const now = currentTime();
      const subtasks = task.subtasks.map((item) => item.id === subtaskId
        ? { ...item, completed: !item.completed, updatedAt: now }
        : item);
      const next = [...tasks];
      next[index] = { ...task, subtasks, updatedAt: now };
      if (task.parentAutoComplete && !task.completed && subtasks.length > 0 &&
        subtasks.every((item) => item.completed)) completeTask(next, index, now);
      persist(next);
    },
    removeSubtask(taskId, subtaskId) {
      const index = taskIndex(taskId);
      const task = tasks[index];
      if (!task.subtasks.some((subtask) => subtask.id === subtaskId)) {
        throw new TaskValidationError('Subtask was not found.');
      }
      const now = currentTime();
      const subtasks = task.subtasks
        .filter((subtask) => subtask.id !== subtaskId)
        .map((subtask, manualOrder) => ({ ...subtask, manualOrder }));
      const next = [...tasks];
      next[index] = { ...task, subtasks, updatedAt: now };
      persist(next);
    },
    reorderSubtasks(taskId, orderedIds) {
      const index = taskIndex(taskId);
      const task = tasks[index];
      const currentIds = new Set(task.subtasks.map((subtask) => subtask.id));
      if (orderedIds.length !== task.subtasks.length || new Set(orderedIds).size !== orderedIds.length ||
        orderedIds.some((id) => !currentIds.has(id))) {
        throw new TaskValidationError('Subtask order must contain every subtask exactly once.');
      }
      const now = currentTime();
      const byId = new Map(task.subtasks.map((subtask) => [subtask.id, subtask]));
      const subtasks = orderedIds.map((id, manualOrder) => ({ ...byId.get(id)!, manualOrder }));
      const next = [...tasks];
      next[index] = { ...task, subtasks, updatedAt: now };
      persist(next);
    },
    subtaskProgress(taskId) {
      return calculateSubtaskProgress(tasks[taskIndex(taskId)].subtasks);
    },
    reorderVisible(orderedVisibleIds) {
      if (preferences.sort !== 'manual' || preferences.view === 'upcoming') {
        throw new TaskValidationError('Manual reordering is unavailable while automatic sorting is active.');
      }
      const currentVisibleIds = visible().map((task) => task.id);
      if (orderedVisibleIds.length !== currentVisibleIds.length ||
        orderedVisibleIds.some((id) => !currentVisibleIds.includes(id))) {
        throw new TaskValidationError('Reordered tasks must contain every visible task exactly once.');
      }
      const manualTaskOrder = mergeVisibleOrder(preferences.manualTaskOrder, orderedVisibleIds);
      persist(tasks, { ...preferences, manualTaskOrder });
    },
    clearMessage() {
      message = '';
      if (status === 'error') status = 'ready';
    },
    snapshot() {
      return {
        tasks: tasks.map(cloneTask),
        preferences: { ...preferences, manualTaskOrder: [...preferences.manualTaskOrder] },
        visibleTasks: visible().map(cloneTask),
        statistics: calculateTaskStatistics(tasks, currentDate()),
        status,
        message,
      };
    },
  };

  return store;
}
