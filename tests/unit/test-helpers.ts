import type { StorageLike } from '../../src/lib/task-repository';
import type { TaskFactoryOptions } from '../../src/lib/task-model';

export const FIXED_TODAY = '2026-08-24';
export const FIXED_NOW = '2026-08-24T10:00:00.000Z';

export function createFixedClock(startSecond = 0): Required<Pick<TaskFactoryOptions, 'now' | 'today'>> {
  let second = startSecond;
  return {
    now: () => `2026-08-24T10:00:${String(second++).padStart(2, '0')}.000Z`,
    today: () => FIXED_TODAY,
  };
}

export class MemoryStorage implements StorageLike {
  data = new Map<string, string>();
  failReads = false;
  failWrites = false;

  getItem(key: string): string | null {
    if (this.failReads) throw new Error('read failed');
    return this.data.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    if (this.failWrites) throw new Error('write failed');
    this.data.set(key, value);
  }
}
