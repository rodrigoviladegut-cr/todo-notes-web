<script lang="ts">
  import { onMount } from 'svelte';
  import TaskComposer from './components/TaskComposer.svelte';
  import TaskList from './components/TaskList.svelte';
  import StorageMessage from './components/StorageMessage.svelte';
  import { createTaskRepository } from './lib/task-repository';
  import {
    createTaskStore,
    type TaskStore,
    type TaskStoreSnapshot,
  } from './lib/task-store';

  let store: TaskStore;
  let state = $state<TaskStoreSnapshot>({ tasks: [], status: 'loading', message: '' });
  let remaining = $derived(state.tasks.filter((task) => !task.completed).length);

  function refresh() {
    state = store.snapshot();
  }

  function addTask(text: string) {
    store.add(text);
    refresh();
  }

  function toggleTask(id: string) {
    store.toggle(id);
    refresh();
  }

  function editTask(id: string, text: string) {
    store.edit(id, text);
    refresh();
  }

  function deleteTask(id: string) {
    store.remove(id);
    refresh();
  }

  function dismissMessage() {
    store.clearMessage();
    refresh();
  }

  onMount(() => {
    store = createTaskStore(createTaskRepository(window.localStorage));
    store.load();
    refresh();
  });
</script>

<svelte:head>
  <title>Field Notes | TODO Notes</title>
</svelte:head>

<main>
  <header class="masthead">
    <a class="wordmark" href="/" aria-label="Field Notes home">
      <span>Field</span>
      <span>Notes</span>
    </a>
    <p class="issue">Daily list / No. 001</p>
  </header>

  <section class="intro" aria-labelledby="page-title">
    <p class="eyebrow">A place for the next thing</p>
    <h1 id="page-title">Make room<br />for <em>doing.</em></h1>
    <p class="dek">
      Keep the day honest. Capture what matters, mark what is done, and leave the noise
      somewhere else.
    </p>
  </section>

  <section class="notebook" aria-label="TODO notes">
    <TaskComposer oncreate={addTask} />

    <div class="list-heading">
      <h2>Today&rsquo;s notes</h2>
      <p aria-live="polite">
        {state.tasks.length} {state.tasks.length === 1 ? 'note' : 'notes'} / {remaining} open
      </p>
    </div>

    <StorageMessage message={state.message} ondismiss={dismissMessage} />

    {#if state.status === 'loading'}
      <p class="loading" aria-live="polite">Opening your notebook...</p>
    {:else}
      <TaskList
        tasks={state.tasks}
        ontoggle={toggleTask}
        onedit={editTask}
        ondelete={deleteTask}
      />
    {/if}
  </section>

  <footer>
    <p>Saved on this device.</p>
    <p>Small steps, kept visible.</p>
  </footer>
</main>
