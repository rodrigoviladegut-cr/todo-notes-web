<script lang="ts">
  import type {
    Priority,
    Recurrence,
    RecurrenceFrequency,
    Task,
    TaskUpdate,
  } from '../lib/task-model';
  import {
    isLocalDate,
    normalizeCategory,
    normalizeTags,
    normalizeTaskTitle,
    TaskValidationError,
  } from '../lib/task-model';
  import SubtaskList from './SubtaskList.svelte';

  let {
    task,
    onupdate,
    onclose,
    onaddsubtask,
    oneditsubtask,
    ontogglesubtask,
    onremovesubtask,
    onreordersubtasks,
  }: {
    task: Task;
    onupdate: (id: string, update: TaskUpdate) => void;
    onclose: () => void;
    onaddsubtask: (taskId: string, title: string) => void;
    oneditsubtask: (taskId: string, subtaskId: string, title: string) => void;
    ontogglesubtask: (taskId: string, subtaskId: string) => void;
    onremovesubtask: (taskId: string, subtaskId: string) => void;
    onreordersubtasks: (taskId: string, orderedIds: readonly string[]) => void;
  } = $props();

  // The form is an editable snapshot; later task changes must not overwrite in-progress edits.
  // svelte-ignore state_referenced_locally
  const initialTask = task;
  let title = $state(initialTask.title);
  let description = $state(initialTask.description);
  let dueDate = $state(initialTask.dueDate ?? '');
  let priority = $state<Priority>(initialTask.priority);
  let category = $state(initialTask.category ?? '');
  let tags = $state(initialTask.tags.join(', '));
  let recurrence = $state<RecurrenceFrequency>(initialTask.recurrence?.frequency ?? 'none');
  let parentAutoComplete = $state(initialTask.parentAutoComplete);
  let error = $state('');
  let loadedTaskId = $state(initialTask.id);

  $effect(() => {
    if (task.id === loadedTaskId) return;

    loadedTaskId = task.id;
    title = task.title;
    description = task.description;
    dueDate = task.dueDate ?? '';
    priority = task.priority;
    category = task.category ?? '';
    tags = task.tags.join(', ');
    recurrence = task.recurrence?.frequency ?? 'none';
    parentAutoComplete = task.parentAutoComplete;
    error = '';
  });

  function save(event: SubmitEvent) {
    event.preventDefault();
    error = '';

    try {
      if (!title.trim()) throw new TaskValidationError('A task cannot be empty.');
      const normalizedTitle = normalizeTaskTitle(title);
      const normalizedDueDate = dueDate.trim() || null;

      if (normalizedDueDate !== null && !isLocalDate(normalizedDueDate)) {
        throw new TaskValidationError('Enter a valid due date.');
      }
      if (recurrence !== 'none' && normalizedDueDate === null) {
        throw new TaskValidationError(
          'Choose a due date before setting this task to repeat. Recurring tasks require a due date.',
        );
      }

      const normalizedCategory = category.trim() ? normalizeCategory(category) : null;
      const normalizedTags = tags.trim() ? normalizeTags(tags.split(',')) : [];
      const normalizedRecurrence: Recurrence | null =
        recurrence === 'none' ? null : { frequency: recurrence };

      onupdate(task.id, {
        title: normalizedTitle,
        description,
        dueDate: normalizedDueDate,
        priority,
        category: normalizedCategory,
        tags: normalizedTags,
        recurrence: normalizedRecurrence,
        parentAutoComplete,
      });
      onclose();
    } catch (reason) {
      error = reason instanceof Error ? reason.message : 'The task details could not be saved.';
    }
  }
</script>

<section class="task-details" aria-labelledby={`task-details-heading-${task.id}`}>
  <div class="details-heading">
    <div>
      <p class="section-label">Task details</p>
      <h3 id={`task-details-heading-${task.id}`}>Shape the work</h3>
    </div>
    <p>Every field except the title is optional.</p>
  </div>

  <form class="details-form" onsubmit={save} novalidate>
    <div class="field field-wide">
      <label for={`task-title-${task.id}`}>Edit task</label>
      <input
        id={`task-title-${task.id}`}
        name="title"
        bind:value={title}
        required
        aria-invalid={error && !title.trim() ? 'true' : undefined}
        aria-describedby={error ? `task-details-error-${task.id}` : undefined}
        autocomplete="off"
      />
    </div>

    <div class="field field-wide">
      <label for={`task-description-${task.id}`}>Description</label>
      <textarea
        id={`task-description-${task.id}`}
        name="description"
        bind:value={description}
        rows="4"
        placeholder="Context, links, or the outcome you need"
      ></textarea>
    </div>

    <div class="field">
      <label for={`task-due-date-${task.id}`}>Due date</label>
      <input
        id={`task-due-date-${task.id}`}
        name="due-date"
        type="date"
        bind:value={dueDate}
        aria-describedby={recurrence !== 'none' && !dueDate ? `recurrence-help-${task.id}` : undefined}
      />
    </div>

    <div class="field">
      <label for={`task-priority-${task.id}`}>Priority</label>
      <select id={`task-priority-${task.id}`} name="priority" bind:value={priority}>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
    </div>

    <div class="field">
      <label for={`task-category-${task.id}`}>Category</label>
      <input
        id={`task-category-${task.id}`}
        name="category"
        bind:value={category}
        placeholder="For example, Home"
        autocomplete="off"
      />
    </div>

    <div class="field">
      <label for={`task-recurrence-${task.id}`}>Recurrence</label>
      <select id={`task-recurrence-${task.id}`} name="recurrence" bind:value={recurrence}>
        <option value="none">None</option>
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>
      {#if recurrence !== 'none' && !dueDate}
        <p class="field-hint warning" id={`recurrence-help-${task.id}`}>
          Add a due date before saving a recurring task.
        </p>
      {/if}
    </div>

    <div class="field field-wide">
      <label for={`task-tags-${task.id}`}>Tags</label>
      <input
        id={`task-tags-${task.id}`}
        name="tags"
        bind:value={tags}
        aria-describedby={`task-tags-help-${task.id}`}
        placeholder="planning, calls, deep work"
        autocomplete="off"
      />
      <p class="field-hint" id={`task-tags-help-${task.id}`}>Separate tags with commas.</p>
    </div>

    <label class="check-field field-wide" for={`task-auto-complete-${task.id}`}>
      <input
        id={`task-auto-complete-${task.id}`}
        name="parent-auto-complete"
        type="checkbox"
        bind:checked={parentAutoComplete}
      />
      <span>
        <strong>Complete the parent automatically</strong>
        Mark this task complete when every subtask is complete.
      </span>
    </label>

    {#if error}
      <p class="form-error field-wide" id={`task-details-error-${task.id}`} role="alert">{error}</p>
    {/if}

    <div class="form-actions field-wide">
      <button class="save-button" type="submit">Save</button>
      <button class="cancel-button" type="button" onclick={onclose}>Cancel</button>
    </div>
  </form>

  <SubtaskList
    {task}
    {onaddsubtask}
    {oneditsubtask}
    {ontogglesubtask}
    {onremovesubtask}
    {onreordersubtasks}
  />
</section>

<style>
  .task-details {
    min-width: 0;
    margin-top: 20px;
    padding: clamp(18px, 4vw, 30px);
    border: 1px solid var(--ink, #18233a);
    border-top: 5px solid var(--ink, #18233a);
    background: var(--sheet, #fffaf0);
  }

  .details-heading {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 24px;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--line, rgba(24, 35, 58, 0.2));
  }

  .details-heading h3 {
    margin: 3px 0 0;
    font-family: Georgia, "Times New Roman", serif;
    font-size: clamp(1.45rem, 4vw, 2rem);
    font-weight: 400;
  }

  .details-heading > p,
  .section-label {
    margin: 0;
  }

  .details-heading > p {
    max-width: 30ch;
    color: color-mix(in srgb, var(--ink, #18233a) 72%, transparent);
    font-size: 0.82rem;
    text-align: right;
  }

  .section-label {
    color: var(--red-dark, #932e20);
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .details-form {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }

  .field {
    display: grid;
    min-width: 0;
    gap: 7px;
  }

  .field-wide {
    grid-column: 1 / -1;
  }

  .field label,
  .check-field strong {
    font-size: 0.82rem;
    font-weight: 800;
    letter-spacing: 0.03em;
  }

  input,
  textarea,
  select {
    width: 100%;
    min-width: 0;
    padding: 11px 12px;
    border: 1px solid var(--ink, #18233a);
    border-radius: 0;
    color: inherit;
    background: var(--sheet, #fffaf0);
    font: inherit;
  }

  textarea {
    resize: vertical;
    line-height: 1.5;
  }

  .field-hint {
    margin: 0;
    overflow-wrap: anywhere;
    font-size: 0.78rem;
  }

  .warning {
    color: var(--red-dark, #932e20);
    font-weight: 700;
  }

  .check-field {
    display: flex;
    align-items: flex-start;
    gap: 11px;
    padding: 14px;
    border: 1px solid var(--line, rgba(24, 35, 58, 0.2));
    cursor: pointer;
  }

  .check-field input {
    width: 18px;
    height: 18px;
    margin: 2px 0 0;
    flex: 0 0 auto;
    accent-color: var(--red-dark, #932e20);
  }

  .check-field span {
    display: grid;
    min-width: 0;
    gap: 3px;
    overflow-wrap: anywhere;
    font-size: 0.84rem;
    line-height: 1.4;
  }

  .form-error {
    margin: 0;
    padding: 11px 13px;
    border-left: 4px solid var(--red-dark, #932e20);
    color: var(--red-dark, #932e20);
    background: color-mix(in srgb, var(--red, #c7472f) 12%, transparent);
    overflow-wrap: anywhere;
    font-size: 0.86rem;
    font-weight: 800;
  }

  .form-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 9px;
  }

  .save-button,
  .cancel-button {
    min-height: 44px;
    padding: 10px 20px;
    border: 1px solid var(--ink, #18233a);
    font: inherit;
    font-weight: 800;
  }

  .save-button {
    color: var(--sheet, #fffaf0);
    background: var(--ink, #18233a);
  }

  .cancel-button {
    color: inherit;
    background: transparent;
  }

  @media (max-width: 620px) {
    .details-heading {
      display: grid;
      gap: 8px;
    }

    .details-heading > p {
      text-align: left;
    }

    .details-form {
      grid-template-columns: minmax(0, 1fr);
    }

    .field-wide {
      grid-column: auto;
    }
  }
</style>
