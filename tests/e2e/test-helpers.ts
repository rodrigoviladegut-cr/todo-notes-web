import type { Page } from '@playwright/test';
import type { Task, UserPreferences, Workspace } from '../../src/lib/task-model';
import { createDefaultPreferences } from '../../src/lib/task-preferences';
import { TASK_STORAGE_KEY } from '../../src/lib/task-repository';

const timestamp = '2026-08-24T12:00:00.000Z';

export function localDateFromToday(offsetDays = 0): string {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function taskFixture(
  id: string,
  title: string,
  overrides: Partial<Task> = {},
): Task {
  return {
    id,
    title,
    text: title,
    description: '',
    completed: false,
    priority: 'medium',
    dueDate: null,
    category: null,
    tags: [],
    subtasks: [],
    recurrence: null,
    recurrenceSeriesId: null,
    recurrenceSourceId: null,
    parentAutoComplete: false,
    manualOrder: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  };
}

export async function resetWorkspace(page: Page) {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}

export async function seedWorkspace(
  page: Page,
  tasks: Task[],
  preferenceOverrides: Partial<UserPreferences> = {},
) {
  const orderedTasks = tasks.map((task, manualOrder) => ({ ...task, manualOrder }));
  const preferences: UserPreferences = {
    ...createDefaultPreferences(orderedTasks.map((task) => task.id)),
    ...preferenceOverrides,
  };
  const workspace: Workspace = { version: 2, tasks: orderedTasks, preferences };
  await page.evaluate(
    ({ key, value }) => localStorage.setItem(key, JSON.stringify(value)),
    { key: TASK_STORAGE_KEY, value: workspace },
  );
  await page.reload();
}
