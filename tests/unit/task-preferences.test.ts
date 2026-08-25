import { describe, expect, it } from 'vitest';
import {
  createDefaultPreferences,
  mergePreferences,
  PreferencesValidationError,
  validatePreferences,
} from '../../src/lib/task-preferences';
import { createTaskRepository } from '../../src/lib/task-repository';
import { createTaskStore } from '../../src/lib/task-store';
import { MemoryStorage } from './test-helpers';

describe('task preferences', () => {
  it('provides specified defaults and copies manual order', () => {
    const ids = ['a'];
    const preferences = createDefaultPreferences(ids);
    ids.push('b');
    expect(preferences).toEqual({
      theme: 'light', sort: 'manual', view: 'all', filter: 'all', search: '',
      showCompletedToday: false, manualTaskOrder: ['a'],
    });
  });

  it('merges valid preferences without mutating the previous value', () => {
    const original = createDefaultPreferences(['a']);
    const updated = mergePreferences(original, { theme: 'dark', search: 'focus' });
    expect(updated).toMatchObject({ theme: 'dark', search: 'focus' });
    expect(original.theme).toBe('light');
  });

  it('rejects invalid values and duplicate order identifiers', () => {
    expect(() => validatePreferences({ ...createDefaultPreferences(), theme: 'system' }))
      .toThrow(PreferencesValidationError);
    expect(() => validatePreferences({ ...createDefaultPreferences(), manualTaskOrder: ['a', 'a'] }))
      .toThrow(PreferencesValidationError);
  });

  it('persists preferences across stores and keeps failed updates visible for recovery', () => {
    const storage = new MemoryStorage();
    const first = createTaskStore(createTaskRepository(storage), { id: () => 'task-1' });
    first.load();
    first.add('Task');
    first.updatePreferences({
      theme: 'dark',
      sort: 'priority',
      view: 'today',
      filter: 'active',
      search: 'focus',
      showCompletedToday: true,
    });

    const reloaded = createTaskStore(createTaskRepository(storage));
    reloaded.load();
    expect(reloaded.preferences).toMatchObject({
      theme: 'dark', sort: 'priority', view: 'today', filter: 'active', search: 'focus',
      showCompletedToday: true, manualTaskOrder: ['task-1'],
    });

    storage.failWrites = true;
    reloaded.updatePreferences({ theme: 'light' });
    expect(reloaded.preferences.theme).toBe('light');
    expect(reloaded.status).toBe('error');
    expect(reloaded.message).toContain('could not be saved');

    storage.failWrites = false;
    reloaded.updatePreferences({ search: '' });
    expect(reloaded.status).toBe('ready');
    expect(reloaded.message).toBe('');

    const recovered = createTaskStore(createTaskRepository(storage));
    recovered.load();
    expect(recovered.preferences).toMatchObject({ theme: 'light', search: '' });
  });
});
