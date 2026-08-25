import {
  isTask,
  withTaskTextAlias,
  type Task,
  type Workspace,
} from './task-model';
import { createDefaultPreferences, isUserPreferences } from './task-preferences';

export const WORKSPACE_VERSION = 2 as const;

export class WorkspaceMigrationError extends Error {
  constructor(message = 'Saved workspace data is malformed.') {
    super(message);
    this.name = 'WorkspaceMigrationError';
  }
}

interface LegacyTask {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface LegacyWorkspace {
  version: 1;
  tasks: LegacyTask[];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isLegacyTask(value: unknown): value is LegacyTask {
  if (!value || typeof value !== 'object') return false;
  const task = value as Record<string, unknown>;
  return (
    isNonEmptyString(task.id) &&
    isNonEmptyString(task.text) &&
    typeof task.completed === 'boolean' &&
    isNonEmptyString(task.createdAt) &&
    isNonEmptyString(task.updatedAt)
  );
}

function isLegacyWorkspace(value: unknown): value is LegacyWorkspace {
  if (!value || typeof value !== 'object') return false;
  const workspace = value as Record<string, unknown>;
  return workspace.version === 1 && Array.isArray(workspace.tasks) && workspace.tasks.every(isLegacyTask);
}

export function isWorkspace(value: unknown): value is Workspace {
  if (!value || typeof value !== 'object') return false;
  const workspace = value as Record<string, unknown>;
  if (
    workspace.version !== WORKSPACE_VERSION ||
    !Array.isArray(workspace.tasks) ||
    !workspace.tasks.every(isTask) ||
    !isUserPreferences(workspace.preferences)
  ) return false;

  const tasks = workspace.tasks as Task[];
  const ids = tasks.map((task) => task.id);
  const preferences = workspace.preferences as Workspace['preferences'];
  return (
    new Set(ids).size === ids.length &&
    preferences.manualTaskOrder.length === ids.length &&
    preferences.manualTaskOrder.every((id) => ids.includes(id)) &&
    tasks.every((task) => {
      const subtaskIds = task.subtasks.map((subtask) => subtask.id);
      const tagKeys = task.tags.map((tag) => tag.trim().toLocaleLowerCase());
      return (
        new Set(subtaskIds).size === subtaskIds.length &&
        new Set(tagKeys).size === tagKeys.length &&
        task.tags.every((tag) => tag === tag.trim()) &&
        (task.category === null || task.category === task.category.trim())
      );
    })
  );
}

function copyWorkspace(workspace: Workspace): Workspace {
  return {
    version: WORKSPACE_VERSION,
    tasks: workspace.tasks.map((task) => withTaskTextAlias({
      ...task,
      tags: [...task.tags],
      subtasks: task.subtasks.map((subtask) => ({ ...subtask })),
      recurrence: task.recurrence ? { ...task.recurrence } : null,
    })),
    preferences: {
      ...workspace.preferences,
      manualTaskOrder: [...workspace.preferences.manualTaskOrder],
    },
  };
}

export function migrateWorkspace(value: unknown): Workspace {
  if (isWorkspace(value)) return copyWorkspace(value);
  if (!isLegacyWorkspace(value)) throw new WorkspaceMigrationError();

  const tasks: Task[] = value.tasks.map((legacy, manualOrder) => ({
    id: legacy.id,
    title: legacy.text.trim(),
    text: legacy.text.trim(),
    description: '',
    completed: legacy.completed,
    priority: 'medium',
    dueDate: null,
    category: null,
    tags: [],
    subtasks: [],
    recurrence: null,
    recurrenceSeriesId: null,
    recurrenceSourceId: null,
    parentAutoComplete: false,
    manualOrder,
    createdAt: legacy.createdAt,
    updatedAt: legacy.updatedAt,
  }));

  const workspace: Workspace = {
    version: WORKSPACE_VERSION,
    tasks,
    preferences: createDefaultPreferences(tasks.map((task) => task.id)),
  };
  if (!isWorkspace(workspace)) throw new WorkspaceMigrationError();
  return workspace;
}

export function requiresWorkspaceMigration(value: unknown): boolean {
  return isLegacyWorkspace(value);
}
