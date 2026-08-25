<script lang="ts">
  import type { TaskView, UserPreferences } from '../lib/task-model';

  let {
    preferences,
    onupdate,
  }: {
    preferences: UserPreferences;
    onupdate: (patch: Partial<UserPreferences>) => void;
  } = $props();

  function selectView(view: TaskView) {
    onupdate({ view });
  }

  function updateCompletedToday(event: Event) {
    onupdate({ showCompletedToday: (event.currentTarget as HTMLInputElement).checked });
  }
</script>

<nav class="task-views" aria-label="Task views">
  <div class="view-options" role="group" aria-label="Choose a task view">
    <button
      class:active={preferences.view === 'all'}
      type="button"
      aria-pressed={preferences.view === 'all'}
      onclick={() => selectView('all')}
    >All tasks</button>
    <button
      class:active={preferences.view === 'today'}
      type="button"
      aria-pressed={preferences.view === 'today'}
      onclick={() => selectView('today')}
    >Today</button>
    <button
      class:active={preferences.view === 'upcoming'}
      type="button"
      aria-pressed={preferences.view === 'upcoming'}
      onclick={() => selectView('upcoming')}
    >Upcoming</button>
  </div>

  {#if preferences.view === 'today'}
    <label class="completed-today-option">
      <input
        type="checkbox"
        checked={preferences.showCompletedToday}
        onchange={updateCompletedToday}
      />
      Show completed tasks today
    </label>
  {/if}
</nav>
