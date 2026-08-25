<script lang="ts">
  import { onMount } from 'svelte';
  import ProductivitySummary from './components/ProductivitySummary.svelte';
  import StorageMessage from './components/StorageMessage.svelte';
  import TaskComposer from './components/TaskComposer.svelte';
  import TaskList from './components/TaskList.svelte';
  import TaskToolbar from './components/TaskToolbar.svelte';
  import TaskViews from './components/TaskViews.svelte';
  import ThemeToggle from './components/ThemeToggle.svelte';
  import type { TaskUpdate, Theme, UserPreferences } from './lib/task-model';
  import { createDefaultPreferences } from './lib/task-preferences';
  import { createTaskRepository } from './lib/task-repository';
  import { createTaskStore, type TaskStore, type WorkspaceSnapshot } from './lib/task-store';

  const initialPreferences = createDefaultPreferences();
  let store: TaskStore;
  let state = $state<WorkspaceSnapshot>({
    tasks: [],
    preferences: initialPreferences,
    visibleTasks: [],
    statistics: { total: 0, completed: 0, active: 0, overdue: 0, completionPercentage: 0 },
    status: 'loading',
    message: '',
  });
  let manualReorderEnabled = $derived(
    state.preferences.sort === 'manual' && state.preferences.view !== 'upcoming',
  );
  let viewHeading = $derived(
    state.preferences.view === 'today'
      ? "Today's tasks"
      : state.preferences.view === 'upcoming'
        ? 'Upcoming tasks'
        : 'All tasks',
  );

  $effect(() => {
    document.body.classList.toggle('theme-dark', state.preferences.theme === 'dark');
  });

  function refresh() {
    state = store.snapshot();
  }

  function mutate(action: () => void) {
    action();
    refresh();
  }

  function addTask(text: string) {
    mutate(() => { store.add(text); });
  }

  function editTask(id: string, update: string | TaskUpdate) {
    mutate(() => { store.edit(id, update); });
  }

  function updatePreferences(patch: Partial<UserPreferences>) {
    mutate(() => { store.updatePreferences(patch); });
  }

  function setTheme(theme: Theme) {
    updatePreferences({ theme });
  }

  onMount(() => {
    store = createTaskStore(createTaskRepository(window.localStorage));
    store.load();
    refresh();
  });
</script>

<svelte:head>
  <title>Field Notes | Productivity Workspace</title>
</svelte:head>

<main>
  <header class="masthead">
    <a class="wordmark" href="/" aria-label="Field Notes home">
      <span>Field</span>
      <span>Notes</span>
    </a>
    <div class="header-tools">
      <p class="issue">Daily list / Organized</p>
      <ThemeToggle theme={state.preferences.theme} ontoggle={setTheme} />
    </div>
  </header>

  <section class="intro" aria-labelledby="page-title">
    <p class="eyebrow">A place for the next thing</p>
    <h1 id="page-title">Make room<br />for <em>doing.</em></h1>
    <p class="dek">
      Capture quickly. Add shape when the work needs it. Keep every useful signal in view.
    </p>
  </section>

  <ProductivitySummary statistics={state.statistics} />

  <section class="notebook" aria-label="Productivity workspace">
    <TaskComposer oncreate={addTask} />
    <TaskViews preferences={state.preferences} onupdate={updatePreferences} />
    <TaskToolbar preferences={state.preferences} onupdate={updatePreferences} />

    <div class="list-heading">
      <h2>{viewHeading}</h2>
      <p aria-live="polite">
        {state.statistics.total} {state.statistics.total === 1 ? 'note' : 'notes'} /
        {state.statistics.active} open / {state.visibleTasks.length} shown
      </p>
    </div>

    <p class="visually-hidden" aria-live="polite">
      {state.message || `${state.visibleTasks.length} tasks are visible.`}
    </p>
    <StorageMessage message={state.message} ondismiss={() => mutate(() => store.clearMessage())} />

    {#if state.status === 'loading'}
      <p class="loading" aria-live="polite">Opening your workspace...</p>
    {:else}
      <TaskList
        tasks={state.visibleTasks}
        hasAnyTasks={state.tasks.length > 0}
        {manualReorderEnabled}
        ontoggle={(id) => mutate(() => store.toggle(id))}
        onedit={editTask}
        ondelete={(id) => mutate(() => store.remove(id))}
        onreorder={(ids) => mutate(() => store.reorderVisible(ids))}
        onaddsubtask={(taskId, title) => mutate(() => { store.addSubtask(taskId, title); })}
        oneditsubtask={(taskId, subtaskId, title) => mutate(() => store.editSubtask(taskId, subtaskId, title))}
        ontogglesubtask={(taskId, subtaskId) => mutate(() => store.toggleSubtask(taskId, subtaskId))}
        onremovesubtask={(taskId, subtaskId) => mutate(() => store.removeSubtask(taskId, subtaskId))}
        onreordersubtasks={(taskId, ids) => mutate(() => store.reorderSubtasks(taskId, ids))}
      />
    {/if}
  </section>

  <footer>
    <p>Saved on this device.</p>
    <p>Small steps, kept visible.</p>
  </footer>
</main>
