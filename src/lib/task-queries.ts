import {
  isOverdue,
  type Task,
  type UserPreferences,
} from './task-model';

export type TaskQuery = Pick<
  UserPreferences,
  'view' | 'filter' | 'search' | 'sort' | 'showCompletedToday' | 'manualTaskOrder'
>;

function manualRank(task: Task, order: readonly string[]): number {
  const index = order.indexOf(task.id);
  return index === -1 ? task.manualOrder : index;
}

export function queryTasks(
  tasks: readonly Task[],
  query: TaskQuery,
  today: string,
): Task[] {
  const search = query.search.trim().toLocaleLowerCase();
  const matchesSearch = (task: Task) =>
    !search ||
    [task.title, task.description, task.category ?? '', ...task.tags]
      .some((value) => value.toLocaleLowerCase().includes(search));

  const result = tasks.filter((task) => {
    if (query.view === 'today') {
      if (task.dueDate === null || task.dueDate > today) return false;
      if (task.completed && !query.showCompletedToday) return false;
    }
    if (query.view === 'upcoming' &&
      (task.completed || task.dueDate === null || task.dueDate <= today)) return false;

    if (query.filter === 'active' && task.completed) return false;
    if (query.filter === 'completed' && !task.completed) return false;
    if (query.filter === 'overdue' && !isOverdue(task, today)) return false;
    return matchesSearch(task);
  });

  const tie = (left: Task, right: Task) =>
    manualRank(left, query.manualTaskOrder) - manualRank(right, query.manualTaskOrder);
  const sort = query.view === 'upcoming' ? 'due-date' : query.sort;

  return result.sort((left, right) => {
    if (sort === 'priority') {
      const rank = { high: 0, medium: 1, low: 2 } as const;
      return rank[left.priority] - rank[right.priority] || tie(left, right);
    }
    if (sort === 'due-date') {
      if (left.dueDate === null) return right.dueDate === null ? tie(left, right) : 1;
      if (right.dueDate === null) return -1;
      return left.dueDate.localeCompare(right.dueDate) || tie(left, right);
    }
    return tie(left, right);
  });
}

export function mergeVisibleOrder(
  fullOrder: readonly string[],
  reorderedVisibleIds: readonly string[],
): string[] {
  const visible = new Set(reorderedVisibleIds);
  const slots = fullOrder.filter((id) => visible.has(id));
  if (
    slots.length !== reorderedVisibleIds.length ||
    slots.some((id) => !visible.has(id)) ||
    new Set(reorderedVisibleIds).size !== reorderedVisibleIds.length
  ) {
    throw new Error('Reordered tasks must contain every visible task exactly once.');
  }
  let index = 0;
  return fullOrder.map((id) => visible.has(id) ? reorderedVisibleIds[index++] : id);
}

export const getVisibleTasks = queryTasks;
