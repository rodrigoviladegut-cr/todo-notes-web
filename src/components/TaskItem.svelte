<script lang="ts">
  import { isOverdue, type Task, type TaskUpdate } from '../lib/task-model';
  import TaskDetails from './TaskDetails.svelte';

  let {
    task,
    index,
    total,
    manualReorderEnabled,
    ontoggle,
    onedit,
    ondelete,
    onmove,
    ondragstart,
    ondragend,
    ondrop,
    onaddsubtask,
    oneditsubtask,
    ontogglesubtask,
    onremovesubtask,
    onreordersubtasks,
  }: {
    task: Task;
    index: number;
    total: number;
    manualReorderEnabled: boolean;
    ontoggle: (id: string) => void;
    onedit: (id: string, update: string | TaskUpdate) => void;
    ondelete: (id: string) => void;
    onmove: (id: string, offset: -1 | 1) => void;
    ondragstart: (id: string, event: DragEvent) => void;
    ondragend: () => void;
    ondrop: (id: string, event: DragEvent) => void;
    onaddsubtask: (taskId: string, title: string) => void;
    oneditsubtask: (taskId: string, subtaskId: string, title: string) => void;
    ontogglesubtask: (taskId: string, subtaskId: string) => void;
    onremovesubtask: (taskId: string, subtaskId: string) => void;
    onreordersubtasks: (taskId: string, orderedIds: readonly string[]) => void;
  } = $props();

  let editing = $state(false);
  let confirmingDelete = $state(false);
  let overdue = $derived(isOverdue(task));
  let completedSubtasks = $derived(task.subtasks.filter((subtask) => subtask.completed).length);
  let recurrenceLabel = $derived(
    task.recurrence
      ? `${task.recurrence.frequency[0].toUpperCase()}${task.recurrence.frequency.slice(1)}`
      : '',
  );
</script>

<li
  class="task-card"
  class:completed={task.completed}
  class:overdue
  class:high-priority={task.priority === 'high'}
  data-testid="task-item"
  draggable={manualReorderEnabled}
  ondragstart={(event) => ondragstart(task.id, event)}
  ondragend={ondragend}
  ondragover={(event) => {
    if (manualReorderEnabled) event.preventDefault();
  }}
  ondrop={(event) => ondrop(task.id, event)}
>
  <div class="task-main">
    <button
      class="status-button"
      type="button"
      aria-label={task.completed ? `Reopen ${task.title}` : `Complete ${task.title}`}
      aria-pressed={task.completed}
      onclick={() => ontoggle(task.id)}
    >
      <span aria-hidden="true">{task.completed ? 'x' : ''}</span>
    </button>

    <div class="task-copy">
      <p class="task-text">{task.title}</p>
      <div class="task-badges" aria-label={`Status and priority for ${task.title}`}>
        <span class="state-badge">{task.completed ? 'Completed' : overdue ? 'Overdue' : 'Active'}</span>
        <span class="priority-badge">{task.priority} priority</span>
        {#if task.dueDate}<span>Due {task.dueDate}</span>{/if}
        {#if task.category}<span>Category: {task.category}</span>{/if}
        {#if recurrenceLabel}<span>Repeats {recurrenceLabel.toLowerCase()}</span>{/if}
        {#if task.recurrenceSourceId}<span>Recurring follow-up</span>{/if}
      </div>
      {#if task.description}<p class="task-description">{task.description}</p>{/if}
      {#if task.tags.length > 0}
        <ul class="tag-list" aria-label={`Tags for ${task.title}`}>
          {#each task.tags as tag}<li>#{tag}</li>{/each}
        </ul>
      {/if}
      {#if task.subtasks.length > 0}
        <p class="subtask-summary">
          Subtasks: {completedSubtasks} of {task.subtasks.length} complete
        </p>
      {/if}
    </div>

    <div class="task-actions">
      <button
        class="quiet small"
        type="button"
        aria-expanded={editing}
        onclick={() => {
          confirmingDelete = false;
          editing = !editing;
        }}
      >{editing ? 'Close details' : 'Edit'}</button>
      <button
        class="danger-link small"
        type="button"
        onclick={() => {
          editing = false;
          confirmingDelete = true;
        }}
      >Delete</button>
    </div>
  </div>

  <div class="reorder-actions" aria-label={`Manual order controls for ${task.title}`}>
    <span class="drag-label" aria-hidden="true">Drag</span>
    <button
      class="quiet small"
      type="button"
      disabled={!manualReorderEnabled || index === 0}
      title={manualReorderEnabled ? 'Move this task earlier' : 'Choose Manual sort to reorder tasks'}
      onclick={() => onmove(task.id, -1)}
    >Move up</button>
    <button
      class="quiet small"
      type="button"
      disabled={!manualReorderEnabled || index === total - 1}
      title={manualReorderEnabled ? 'Move this task later' : 'Choose Manual sort to reorder tasks'}
      onclick={() => onmove(task.id, 1)}
    >Move down</button>
  </div>

  {#if editing}
    <TaskDetails
      {task}
      onupdate={onedit}
      onclose={() => (editing = false)}
      {onaddsubtask}
      {oneditsubtask}
      {ontogglesubtask}
      {onremovesubtask}
      {onreordersubtasks}
    />
  {/if}

  {#if confirmingDelete}
    <div
      class="delete-confirmation"
      role="alertdialog"
      aria-labelledby={`delete-title-${task.id}`}
      aria-describedby={`delete-copy-${task.id}`}
    >
      <strong id={`delete-title-${task.id}`}>Remove this note?</strong>
      <p id={`delete-copy-${task.id}`}>
        This also removes its {task.subtasks.length} {task.subtasks.length === 1 ? 'subtask' : 'subtasks'} and cannot be undone.
      </p>
      <div class="inline-actions">
        <button class="danger small" type="button" onclick={() => ondelete(task.id)}>Delete task</button>
        <button class="quiet small" type="button" onclick={() => (confirmingDelete = false)}>Keep task</button>
      </div>
    </div>
  {/if}
</li>
