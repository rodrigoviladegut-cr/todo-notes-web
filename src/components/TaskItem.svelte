<script lang="ts">
  import type { Task } from '../lib/task-model';

  let {
    task,
    ontoggle,
    onedit,
    ondelete,
  }: {
    task: Task;
    ontoggle: (id: string) => void;
    onedit: (id: string, text: string) => void;
    ondelete: (id: string) => void;
  } = $props();

  let editing = $state(false);
  let confirmingDelete = $state(false);
  let draft = $state('');
  let editError = $state('');

  function beginEdit() {
    draft = task.text;
    editError = '';
    confirmingDelete = false;
    editing = true;
  }

  function cancelEdit() {
    draft = task.text;
    editError = '';
    editing = false;
  }

  function saveEdit(event: SubmitEvent) {
    event.preventDefault();
    if (!draft.trim()) {
      editError = 'A task cannot be empty.';
      return;
    }

    try {
      onedit(task.id, draft);
      editError = '';
      editing = false;
    } catch (reason) {
      editError = reason instanceof Error ? reason.message : 'That edit could not be saved.';
    }
  }
</script>

<li class:completed={task.completed} class="task-card" data-testid="task-item">
  <div class="task-main">
    <button
      class="status-button"
      type="button"
      aria-label={task.completed ? `Reopen ${task.text}` : `Complete ${task.text}`}
      aria-pressed={task.completed}
      onclick={() => ontoggle(task.id)}
    >
      <span aria-hidden="true">{task.completed ? '✓' : ''}</span>
    </button>

    {#if editing}
      <form class="edit-form" onsubmit={saveEdit} novalidate>
        <label class="visually-hidden" for={`edit-${task.id}`}>Edit task</label>
        <input
          id={`edit-${task.id}`}
          bind:value={draft}
          aria-invalid={editError ? 'true' : undefined}
          aria-describedby={editError ? `edit-error-${task.id}` : undefined}
        />
        {#if editError}
          <p class="field-error" id={`edit-error-${task.id}`}>{editError}</p>
        {/if}
        <div class="inline-actions">
          <button class="primary small" type="submit">Save</button>
          <button class="quiet small" type="button" onclick={cancelEdit}>Cancel</button>
        </div>
      </form>
    {:else}
      <p class="task-text">{task.text}</p>
      <div class="task-actions">
        <button class="quiet small" type="button" onclick={beginEdit}>Edit</button>
        <button
          class="danger-link small"
          type="button"
          onclick={() => {
            editing = false;
            confirmingDelete = true;
          }}
        >Delete</button>
      </div>
    {/if}
  </div>

  {#if confirmingDelete}
    <div
      class="delete-confirmation"
      role="alertdialog"
      aria-labelledby={`delete-title-${task.id}`}
      aria-describedby={`delete-copy-${task.id}`}
    >
      <strong id={`delete-title-${task.id}`}>Remove this note?</strong>
      <p id={`delete-copy-${task.id}`}>This action cannot be undone.</p>
      <div class="inline-actions">
        <button class="danger small" type="button" onclick={() => ondelete(task.id)}>
          Delete task
        </button>
        <button class="quiet small" type="button" onclick={() => (confirmingDelete = false)}>
          Keep task
        </button>
      </div>
    </div>
  {/if}
</li>
