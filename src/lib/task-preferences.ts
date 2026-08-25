import type { UserPreferences } from './task-model';

export class PreferencesValidationError extends Error {
  constructor(message = 'Saved preferences are invalid.') {
    super(message);
    this.name = 'PreferencesValidationError';
  }
}

export function createDefaultPreferences(taskIds: readonly string[] = []): UserPreferences {
  return {
    theme: 'light',
    sort: 'manual',
    view: 'all',
    filter: 'all',
    search: '',
    showCompletedToday: false,
    manualTaskOrder: [...taskIds],
  };
}

export function isUserPreferences(value: unknown): value is UserPreferences {
  if (!value || typeof value !== 'object') return false;
  const preferences = value as Record<string, unknown>;
  return (
    (preferences.theme === 'light' || preferences.theme === 'dark') &&
    ['manual', 'due-date', 'priority'].includes(preferences.sort as string) &&
    ['all', 'today', 'upcoming'].includes(preferences.view as string) &&
    ['all', 'active', 'completed', 'overdue'].includes(preferences.filter as string) &&
    typeof preferences.search === 'string' &&
    typeof preferences.showCompletedToday === 'boolean' &&
    Array.isArray(preferences.manualTaskOrder) &&
    preferences.manualTaskOrder.every((id) => typeof id === 'string' && id.length > 0) &&
    new Set(preferences.manualTaskOrder).size === preferences.manualTaskOrder.length
  );
}

export function validatePreferences(value: unknown): UserPreferences {
  if (!isUserPreferences(value)) throw new PreferencesValidationError();
  return {
    ...value,
    manualTaskOrder: [...value.manualTaskOrder],
  };
}

export function mergePreferences(
  current: UserPreferences,
  patch: Partial<UserPreferences>,
): UserPreferences {
  return validatePreferences({ ...current, ...patch });
}
