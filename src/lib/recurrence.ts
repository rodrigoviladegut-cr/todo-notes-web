import {
  isLocalDate,
  type Recurrence,
  TaskValidationError,
  toLocalDate,
} from './task-model';

function dateParts(value: string): [number, number, number] {
  if (!isLocalDate(value)) throw new TaskValidationError('Expected a valid local calendar date.');
  const [year, month, day] = value.split('-').map(Number);
  return [year, month, day];
}

export function nextRecurrenceDate(dueDate: string, recurrence: Recurrence): string {
  const [year, month, day] = dateParts(dueDate);
  if (recurrence.frequency === 'none') {
    throw new TaskValidationError('A recurrence frequency is required.');
  }
  if (recurrence.frequency === 'monthly') {
    const lastDay = new Date(year, month + 1, 0).getDate();
    return toLocalDate(new Date(year, month, Math.min(day, lastDay)));
  }
  const days = recurrence.frequency === 'daily' ? 1 : 7;
  return toLocalDate(new Date(year, month - 1, day + days));
}

export function advanceRecurrenceToFuture(
  dueDate: string,
  recurrence: Recurrence,
  today = toLocalDate(new Date()),
  monthlyAnchorDay?: number,
): string {
  if (!isLocalDate(today)) throw new TaskValidationError('Expected a valid local calendar date.');
  if (recurrence.frequency === 'monthly') {
    const [year, month, dueDay] = dateParts(dueDate);
    const anchorDay = monthlyAnchorDay ?? dueDay;
    let offset = 1;
    let next: string;
    do {
      const target = new Date(year, month - 1 + offset, 1);
      const targetYear = target.getFullYear();
      const targetMonth = target.getMonth();
      const lastDay = new Date(targetYear, targetMonth + 1, 0).getDate();
      next = toLocalDate(new Date(targetYear, targetMonth, Math.min(anchorDay, lastDay)));
      offset += 1;
    } while (next <= today);
    return next;
  }
  let next = nextRecurrenceDate(dueDate, recurrence);
  while (next <= today) next = nextRecurrenceDate(next, recurrence);
  return next;
}

/** @deprecated Use `advanceRecurrenceToFuture`. */
export const calculateNextDueDate = advanceRecurrenceToFuture;
