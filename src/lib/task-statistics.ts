import { isOverdue, type Subtask, type Task } from './task-model';

export interface TaskStatistics {
  total: number;
  completed: number;
  active: number;
  overdue: number;
  completionPercentage: number;
}

export interface SubtaskProgress {
  total: number;
  completed: number;
  percentage: number;
}

export function calculateTaskStatistics(tasks: readonly Task[], today?: string): TaskStatistics {
  const completed = tasks.filter((task) => task.completed).length;
  const total = tasks.length;
  return {
    total,
    completed,
    active: total - completed,
    overdue: tasks.filter((task) => isOverdue(task, today)).length,
    completionPercentage: total === 0 ? 0 : (completed / total) * 100,
  };
}

export function calculateSubtaskProgress(subtasks: readonly Subtask[]): SubtaskProgress {
  const completed = subtasks.filter((subtask) => subtask.completed).length;
  const total = subtasks.length;
  return {
    total,
    completed,
    percentage: total === 0 ? 0 : (completed / total) * 100,
  };
}

export const getTaskStatistics = calculateTaskStatistics;
