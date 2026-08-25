import { describe, expect, it } from 'vitest';
import { mergeVisibleOrder, queryTasks } from '../../src/lib/task-queries';
import { createDefaultPreferences } from '../../src/lib/task-preferences';
import { makeTask } from './fixtures';

const tasks = [
  makeTask({ id: 'a', title: 'Write report', description: 'Quarterly figures', priority: 'low', dueDate: '2026-08-23', manualOrder: 0 }),
  makeTask({ id: 'b', title: 'Call Sam', category: 'Work', tags: ['Urgent'], priority: 'high', dueDate: '2026-08-24', manualOrder: 1 }),
  makeTask({ id: 'c', title: 'Archive', completed: true, priority: 'high', dueDate: '2026-08-24', manualOrder: 2 }),
  makeTask({ id: 'd', title: 'Buy milk', priority: 'medium', dueDate: '2026-08-26', manualOrder: 3 }),
  makeTask({ id: 'e', title: 'Someday', priority: 'high', dueDate: null, manualOrder: 4 }),
];
const defaults = { ...createDefaultPreferences(tasks.map((task) => task.id)) };

describe('task query pipeline', () => {
  it('searches all supported fields case-insensitively and composes with filters', () => {
    expect(queryTasks(tasks, { ...defaults, search: 'FIGURES', filter: 'overdue' }, '2026-08-24')
      .map((task) => task.id)).toEqual(['a']);
    expect(queryTasks(tasks, { ...defaults, search: 'urgent', filter: 'active' }, '2026-08-24')
      .map((task) => task.id)).toEqual(['b']);
  });

  it('applies Today and Upcoming rules', () => {
    expect(queryTasks(tasks, { ...defaults, view: 'today' }, '2026-08-24').map((task) => task.id))
      .toEqual(['a', 'b']);
    expect(queryTasks(tasks, { ...defaults, view: 'today', showCompletedToday: true }, '2026-08-24')
      .map((task) => task.id)).toEqual(['a', 'b', 'c']);
    expect(queryTasks(tasks, { ...defaults, view: 'upcoming' }, '2026-08-24').map((task) => task.id))
      .toEqual(['d']);
  });

  it('sorts due dates and priorities with manual order ties and undated tasks last', () => {
    expect(queryTasks(tasks, { ...defaults, sort: 'due-date' }, '2026-08-24').map((task) => task.id))
      .toEqual(['a', 'b', 'c', 'd', 'e']);
    expect(queryTasks(tasks, { ...defaults, sort: 'priority' }, '2026-08-24').map((task) => task.id))
      .toEqual(['b', 'c', 'e', 'd', 'a']);
  });

  it('merges a filtered reorder without moving hidden tasks', () => {
    expect(mergeVisibleOrder(['a', 'b', 'c', 'd', 'e'], ['d', 'b']))
      .toEqual(['a', 'd', 'c', 'b', 'e']);
  });

  it('supports full-list reorder and gives automatic sorting precedence over manual order', () => {
    const reordered = ['e', 'd', 'c', 'b', 'a'];
    expect(mergeVisibleOrder(defaults.manualTaskOrder, reordered)).toEqual(reordered);
    expect(queryTasks(tasks, { ...defaults, manualTaskOrder: reordered }, '2026-08-24')
      .map((task) => task.id)).toEqual(reordered);
    expect(queryTasks(tasks, { ...defaults, manualTaskOrder: reordered, sort: 'due-date' }, '2026-08-24')
      .map((task) => task.id)).toEqual(['a', 'c', 'b', 'd', 'e']);
    expect(queryTasks(tasks, { ...defaults, manualTaskOrder: reordered, sort: 'priority' }, '2026-08-24')
      .map((task) => task.id)).toEqual(['e', 'c', 'b', 'd', 'a']);
  });
});
