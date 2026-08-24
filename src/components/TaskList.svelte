<script lang="ts">
  import type { Task } from '../lib/task-model';
  import TaskItem from './TaskItem.svelte';

  let {
    tasks,
    ontoggle,
    onedit,
    ondelete,
  }: {
    tasks: Task[];
    ontoggle: (id: string) => void;
    onedit: (id: string, text: string) => void;
    ondelete: (id: string) => void;
  } = $props();
</script>

{#if tasks.length === 0}
  <div class="empty-state">
    <span aria-hidden="true">01</span>
    <h2>A clear page.</h2>
    <p>Add your first note above and give the day a direction.</p>
  </div>
{:else}
  <ul class="task-list" aria-label="Task notes">
    {#each tasks as task (task.id)}
      <TaskItem {task} {ontoggle} {onedit} {ondelete} />
    {/each}
  </ul>
{/if}
