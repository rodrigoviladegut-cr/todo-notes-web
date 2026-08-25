<script lang="ts">
  import type { Task } from '../lib/task-model';
  import { normalizeTaskTitle } from '../lib/task-model';

  let {
    task,
    onaddsubtask,
    oneditsubtask,
    ontogglesubtask,
    onremovesubtask,
    onreordersubtasks,
  }: {
    task: Task;
    onaddsubtask: (taskId: string, title: string) => void;
    oneditsubtask: (taskId: string, subtaskId: string, title: string) => void;
    ontogglesubtask: (taskId: string, subtaskId: string) => void;
    onremovesubtask: (taskId: string, subtaskId: string) => void;
    onreordersubtasks: (taskId: string, orderedIds: readonly string[]) => void;
  } = $props();

  let newTitle = $state('');
  let editingId = $state<string | null>(null);
  let editTitle = $state('');
  let confirmingDeleteId = $state<string | null>(null);
  let addError = $state('');
  let actionError = $state('');

  let orderedSubtasks = $derived([...task.subtasks].sort((left, right) => left.manualOrder - right.manualOrder));
  let completed = $derived(orderedSubtasks.filter((subtask) => subtask.completed).length);
  let total = $derived(orderedSubtasks.length);
  let percentage = $derived(total === 0 ? 0 : Math.round((completed / total) * 100));

  function errorMessage(reason: unknown, fallback: string) {
    return reason instanceof Error ? reason.message : fallback;
  }

  function add(event: SubmitEvent) {
    event.preventDefault();
    addError = '';

    try {
      onaddsubtask(task.id, normalizeTaskTitle(newTitle));
      newTitle = '';
    } catch (reason) {
      addError = errorMessage(reason, 'The subtask could not be added.');
    }
  }

  function beginEdit(id: string, title: string) {
    editingId = id;
    editTitle = title;
    confirmingDeleteId = null;
    actionError = '';
  }

  function cancelEdit() {
    editingId = null;
    editTitle = '';
    actionError = '';
  }

  function saveEdit(event: SubmitEvent, subtaskId: string) {
    event.preventDefault();
    actionError = '';

    try {
      oneditsubtask(task.id, subtaskId, normalizeTaskTitle(editTitle));
      editingId = null;
      editTitle = '';
    } catch (reason) {
      actionError = errorMessage(reason, 'The subtask edit could not be saved.');
    }
  }

  function toggle(subtaskId: string) {
    actionError = '';
    try {
      ontogglesubtask(task.id, subtaskId);
    } catch (reason) {
      actionError = errorMessage(reason, 'The subtask status could not be changed.');
    }
  }

  function remove(subtaskId: string) {
    actionError = '';
    try {
      onremovesubtask(task.id, subtaskId);
      confirmingDeleteId = null;
      if (editingId === subtaskId) cancelEdit();
    } catch (reason) {
      actionError = errorMessage(reason, 'The subtask could not be deleted.');
    }
  }

  function move(index: number, offset: -1 | 1) {
    const destination = index + offset;
    if (destination < 0 || destination >= orderedSubtasks.length) return;

    const orderedIds = orderedSubtasks.map((subtask) => subtask.id);
    [orderedIds[index], orderedIds[destination]] = [orderedIds[destination], orderedIds[index]];
    actionError = '';

    try {
      onreordersubtasks(task.id, orderedIds);
    } catch (reason) {
      actionError = errorMessage(reason, 'The subtask order could not be changed.');
    }
  }
</script>

<section class="subtasks" aria-labelledby={`subtasks-heading-${task.id}`}>
  <div class="subtask-heading">
    <div>
      <p class="section-label">Checklist</p>
      <h4 id={`subtasks-heading-${task.id}`}>Subtasks</h4>
    </div>
    <p class="progress-copy" aria-live="polite">
      <strong>{completed}/{total}</strong> complete <span aria-hidden="true">&middot;</span> {percentage}%
    </p>
  </div>

  <progress
    value={completed}
    max={total || 1}
    aria-label={`${completed} of ${total} subtasks complete, ${percentage} percent`}
  ></progress>

  <form class="add-form" onsubmit={add} novalidate>
    <label for={`new-subtask-${task.id}`}>Add a subtask to {task.title}</label>
    <div class="add-row">
      <input
        id={`new-subtask-${task.id}`}
        name="subtask"
        bind:value={newTitle}
        aria-invalid={addError ? 'true' : undefined}
        aria-describedby={addError ? `new-subtask-error-${task.id}` : undefined}
        placeholder="Write the next concrete step"
        autocomplete="off"
      />
      <button class="add-button" type="submit">Add subtask</button>
    </div>
    {#if addError}
      <p class="error" id={`new-subtask-error-${task.id}`} role="alert">{addError}</p>
    {/if}
  </form>

  {#if actionError}
    <p class="error action-error" role="alert">{actionError}</p>
  {/if}

  {#if total === 0}
    <p class="empty">No subtasks yet. Add one small, concrete step above.</p>
  {:else}
    <ol class="subtask-list" aria-label={`Subtasks for ${task.title}`}>
      {#each orderedSubtasks as subtask, index (subtask.id)}
        <li class:completed={subtask.completed}>
          {#if editingId === subtask.id}
            <form class="edit-form" onsubmit={(event) => saveEdit(event, subtask.id)} novalidate>
              <label for={`edit-subtask-${subtask.id}`}>Edit subtask: {subtask.title}</label>
              <input
                id={`edit-subtask-${subtask.id}`}
                bind:value={editTitle}
                aria-invalid={actionError ? 'true' : undefined}
                autocomplete="off"
              />
              <div class="edit-actions">
                <button class="small-button strong" type="submit">Save subtask</button>
                <button class="small-button" type="button" onclick={cancelEdit}>Cancel editing</button>
              </div>
            </form>
          {:else}
            <button
              class="toggle-button"
              type="button"
              aria-label={subtask.completed ? `Reopen subtask: ${subtask.title}` : `Complete subtask: ${subtask.title}`}
              aria-pressed={subtask.completed}
              onclick={() => toggle(subtask.id)}
            >
              <span aria-hidden="true">{subtask.completed ? 'x' : ''}</span>
            </button>

            <span class="subtask-title">{subtask.title}</span>

            <div class="subtask-actions" aria-label={`Actions for subtask: ${subtask.title}`}>
              <button
                class="icon-button"
                type="button"
                disabled={index === 0}
                aria-label={`Move subtask up: ${subtask.title}`}
                onclick={() => move(index, -1)}
              >Up</button>
              <button
                class="icon-button"
                type="button"
                disabled={index === total - 1}
                aria-label={`Move subtask down: ${subtask.title}`}
                onclick={() => move(index, 1)}
              >Down</button>
              <button
                class="icon-button"
                type="button"
                aria-label={`Edit subtask: ${subtask.title}`}
                onclick={() => beginEdit(subtask.id, subtask.title)}
              >Edit</button>
              <button
                class="delete-button"
                type="button"
                aria-label={`Delete subtask: ${subtask.title}`}
                onclick={() => {
                  editingId = null;
                  confirmingDeleteId = subtask.id;
                  actionError = '';
                }}
              >Delete</button>
            </div>

            {#if confirmingDeleteId === subtask.id}
              <div class="delete-confirmation" role="alertdialog" aria-labelledby={`delete-subtask-${subtask.id}`}>
                <p id={`delete-subtask-${subtask.id}`}>Delete subtask "{subtask.title}"?</p>
                <button class="confirm-delete" type="button" onclick={() => remove(subtask.id)}>
                  Confirm delete
                </button>
                <button class="small-button" type="button" onclick={() => (confirmingDeleteId = null)}>
                  Keep subtask
                </button>
              </div>
            {/if}
          {/if}
        </li>
      {/each}
    </ol>
  {/if}
</section>

<style>
  .subtasks {
    min-width: 0;
    margin-top: 30px;
    padding-top: 24px;
    border-top: 3px double var(--ink, #18233a);
  }

  .subtask-heading {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 16px;
  }

  .section-label,
  .subtask-heading h4,
  .progress-copy {
    margin: 0;
  }

  .section-label {
    color: var(--red-dark, #932e20);
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .subtask-heading h4 {
    margin-top: 3px;
    font-family: Georgia, "Times New Roman", serif;
    font-size: 1.5rem;
    font-weight: 400;
  }

  .progress-copy {
    font-size: 0.82rem;
  }

  .progress-copy strong {
    font-size: 1rem;
  }

  progress {
    display: block;
    width: 100%;
    height: 8px;
    margin: 12px 0 22px;
    border: 0;
    border-radius: 0;
    background: color-mix(in srgb, var(--ink, #18233a) 14%, transparent);
    accent-color: var(--red-dark, #932e20);
  }

  progress::-webkit-progress-bar {
    background: color-mix(in srgb, var(--ink, #18233a) 14%, transparent);
  }

  progress::-webkit-progress-value {
    background: var(--red-dark, #932e20);
  }

  progress::-moz-progress-bar {
    background: var(--red-dark, #932e20);
  }

  .add-form {
    display: grid;
    gap: 8px;
  }

  .add-form label,
  .edit-form label {
    min-width: 0;
    overflow-wrap: anywhere;
    font-size: 0.82rem;
    font-weight: 800;
  }

  .add-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px;
  }

  input {
    width: 100%;
    min-width: 0;
    padding: 11px 12px;
    border: 1px solid var(--ink, #18233a);
    border-radius: 0;
    color: inherit;
    background: var(--sheet, #fffaf0);
    font: inherit;
  }

  .add-button,
  .small-button,
  .icon-button,
  .delete-button,
  .confirm-delete {
    min-height: 40px;
    padding: 8px 11px;
    border: 1px solid var(--ink, #18233a);
    color: inherit;
    background: transparent;
    font: inherit;
    font-size: 0.78rem;
    font-weight: 800;
  }

  .add-button,
  .strong {
    color: var(--sheet, #fffaf0);
    background: var(--ink, #18233a);
  }

  .error {
    margin: 0;
    color: var(--red-dark, #932e20);
    overflow-wrap: anywhere;
    font-size: 0.82rem;
    font-weight: 800;
  }

  .action-error {
    margin-top: 14px;
    padding: 10px 12px;
    border-left: 4px solid var(--red-dark, #932e20);
  }

  .empty {
    margin: 20px 0 0;
    padding: 22px 14px;
    border: 1px dashed var(--line, rgba(24, 35, 58, 0.2));
    overflow-wrap: anywhere;
    text-align: center;
    font-family: Georgia, "Times New Roman", serif;
  }

  .subtask-list {
    display: grid;
    margin: 22px 0 0;
    padding: 0;
    list-style: none;
  }

  .subtask-list li {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: 11px;
    align-items: center;
    min-width: 0;
    padding: 13px 0;
    border-top: 1px solid var(--line, rgba(24, 35, 58, 0.2));
  }

  .toggle-button {
    display: grid;
    width: 25px;
    height: 25px;
    padding: 0;
    place-items: center;
    border: 2px solid var(--ink, #18233a);
    border-radius: 50%;
    color: var(--sheet, #fffaf0);
    background: transparent;
    font-size: 0.72rem;
    font-weight: 900;
  }

  .completed .toggle-button {
    border-color: var(--red-dark, #932e20);
    background: var(--red-dark, #932e20);
  }

  .subtask-title {
    min-width: 0;
    overflow-wrap: anywhere;
    line-height: 1.4;
  }

  .completed .subtask-title {
    opacity: 0.62;
    text-decoration: line-through 2px var(--red-dark, #932e20);
  }

  .subtask-actions,
  .edit-actions,
  .delete-confirmation {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    align-items: center;
  }

  .icon-button:disabled {
    cursor: not-allowed;
    opacity: 0.38;
  }

  .delete-button {
    border-color: transparent;
    color: var(--red-dark, #932e20);
  }

  .edit-form,
  .delete-confirmation {
    grid-column: 1 / -1;
  }

  .edit-form {
    display: grid;
    min-width: 0;
    gap: 8px;
  }

  .delete-confirmation {
    padding: 11px 12px;
    border-left: 4px solid var(--red-dark, #932e20);
    background: color-mix(in srgb, var(--red, #c7472f) 12%, transparent);
  }

  .delete-confirmation p {
    min-width: 0;
    margin: 0 auto 0 0;
    overflow-wrap: anywhere;
    font-size: 0.84rem;
    font-weight: 800;
  }

  .confirm-delete {
    border-color: var(--red-dark, #932e20);
    color: var(--sheet, #fffaf0);
    background: var(--red-dark, #932e20);
  }

  @media (max-width: 720px) {
    .subtask-list li {
      grid-template-columns: auto minmax(0, 1fr);
    }

    .subtask-actions {
      grid-column: 2;
      justify-content: flex-start;
    }
  }

  @media (max-width: 500px) {
    .subtask-heading {
      display: grid;
      gap: 6px;
    }

    .add-row {
      grid-template-columns: minmax(0, 1fr);
    }

    .add-button {
      justify-self: start;
    }

    .delete-confirmation p {
      flex-basis: 100%;
    }
  }
</style>
