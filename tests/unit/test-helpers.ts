import type { StorageLike } from '../../src/lib/task-repository';

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
