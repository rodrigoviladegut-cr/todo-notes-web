<script lang="ts">
  import type { Task, TaskUpdate } from '../lib/task-model';
  import TaskItem from './TaskItem.svelte';

  let {
    tasks,
    hasAnyTasks,
    manualReorderEnabled,
    ontoggle,
    onedit,
    ondelete,
    onreorder,
    onaddsubtask,
    oneditsubtask,
    ontogglesubtask,
    onremovesubtask,
    onreordersubtasks,
  }: {
    tasks: Task[];
    hasAnyTasks: boolean;
    manualReorderEnabled: boolean;
    ontoggle: (id: string) => void;
    onedit: (id: string, update: string | TaskUpdate) => void;
    ondelete: (id: string) => void;
    onreorder: (orderedIds: readonly string[]) => void;
    onaddsubtask: (taskId: string, title: string) => void;
    oneditsubtask: (taskId: string, subtaskId: string, title: string) => void;
    ontogglesubtask: (taskId: string, subtaskId: string) => void;
    onremovesubtask: (taskId: string, subtaskId: string) => void;
    onreordersubtasks: (taskId: string, orderedIds: readonly string[]) => void;
  } = $props();

  let draggedId = $state<string | null>(null);

  function move(id: string, offset: -1 | 1) {
    if (!manualReorderEnabled) return;
    const ids = tasks.map((task) => task.id);
    const index = ids.indexOf(id);
    const destination = index + offset;
    if (index === -1 || destination < 0 || destination >= ids.length) return;
    [ids[index], ids[destination]] = [ids[destination], ids[index]];
    onreorder(ids);
  }

  function startDrag(id: string, event: DragEvent) {
    if (!manualReorderEnabled) {
      event.preventDefault();
      return;
    }
    draggedId = id;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', id);
    }
  }

  function drop(targetId: string, event: DragEvent) {
    event.preventDefault();
    if (!manualReorderEnabled || !draggedId || draggedId === targetId) return;
    const ids = tasks.map((task) => task.id);
    const sourceIndex = ids.indexOf(draggedId);
    if (sourceIndex === -1) return;
    ids.splice(sourceIndex, 1);
    const targetIndex = ids.indexOf(targetId);
    ids.splice(targetIndex, 0, draggedId);
    draggedId = null;
    onreorder(ids);
  }
</script>

{#if tasks.length === 0}
  <div class="empty-state">
    <span aria-hidden="true">{hasAnyTasks ? '00' : '01'}</span>
    <h2>{hasAnyTasks ? 'No matching tasks.' : 'A clear page.'}</h2>
    <p>
      {hasAnyTasks
        ? 'Adjust the search, filter, or view to bring more work into focus.'
        : 'Add your first note above and give the day a direction.'}
    </p>
  </div>
{:else}
  <ul class="task-list" aria-label="Task notes">
    {#each tasks as task, index (task.id)}
      <TaskItem
        {task}
        {index}
        total={tasks.length}
        {manualReorderEnabled}
        {ontoggle}
        {onedit}
        {ondelete}
        onmove={move}
        ondragstart={startDrag}
        ondragend={() => (draggedId = null)}
        ondrop={drop}
        {onaddsubtask}
        {oneditsubtask}
        {ontogglesubtask}
        {onremovesubtask}
        {onreordersubtasks}
      />
    {/each}
  </ul>
{/if}
