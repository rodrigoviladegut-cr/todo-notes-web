<script lang="ts">
  import type { TaskFilter, TaskSort, UserPreferences } from '../lib/task-model';

  let {
    preferences,
    onupdate,
  }: {
    preferences: UserPreferences;
    onupdate: (patch: Partial<UserPreferences>) => void;
  } = $props();

  let reorderStatus = $derived(
    preferences.sort !== 'manual'
      ? 'Manual reorder is unavailable while automatic sorting is active.'
      : preferences.view === 'upcoming'
        ? 'Manual reorder is unavailable in the Upcoming view.'
        : 'Manual reorder is available.',
  );

  function updateSearch(event: Event) {
    onupdate({ search: (event.currentTarget as HTMLInputElement).value });
  }

  function updateFilter(event: Event) {
    onupdate({ filter: (event.currentTarget as HTMLSelectElement).value as TaskFilter });
  }

  function updateSort(event: Event) {
    onupdate({ sort: (event.currentTarget as HTMLSelectElement).value as TaskSort });
  }
</script>

<section class="task-toolbar" aria-label="Task controls">
  <div class="toolbar-field toolbar-search">
    <label for="task-search">Search tasks</label>
    <input
      id="task-search"
      name="task-search"
      type="search"
      value={preferences.search}
      oninput={updateSearch}
      autocomplete="off"
    />
  </div>

  <div class="toolbar-field">
    <label for="task-filter">Status filter</label>
    <select id="task-filter" name="task-filter" value={preferences.filter} onchange={updateFilter}>
      <option value="all">All</option>
      <option value="active">Active</option>
      <option value="completed">Completed</option>
      <option value="overdue">Overdue</option>
    </select>
  </div>

  <div class="toolbar-field">
    <label for="task-sort">Sort tasks</label>
    <select id="task-sort" name="task-sort" value={preferences.sort} onchange={updateSort}>
      <option value="manual">Manual</option>
      <option value="due-date">Due date</option>
      <option value="priority">Priority</option>
    </select>
  </div>

  <p class="reorder-status" aria-live="polite">{reorderStatus}</p>
</section>
