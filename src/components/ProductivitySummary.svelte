<script lang="ts">
  import type { TaskStatistics } from '../lib/task-statistics';

  let { statistics }: { statistics: TaskStatistics } = $props();

  let completionPercentage = $derived(Math.round(statistics.completionPercentage));
</script>

<section class="productivity-summary" aria-labelledby="productivity-summary-title">
  <h2 id="productivity-summary-title">Productivity summary</h2>

  <dl class="statistics-grid">
    <div class="statistic total-statistic">
      <dt>Total tasks</dt>
      <dd>{statistics.total}</dd>
    </div>
    <div class="statistic completed-statistic">
      <dt>Completed tasks</dt>
      <dd>{statistics.completed}</dd>
    </div>
    <div class="statistic active-statistic">
      <dt>Active tasks</dt>
      <dd>{statistics.active}</dd>
    </div>
    <div class="statistic overdue-statistic">
      <dt>Overdue tasks</dt>
      <dd>{statistics.overdue}</dd>
    </div>
    <div class="statistic completion-statistic">
      <dt>Completion</dt>
      <dd>{completionPercentage}% complete</dd>
    </div>
  </dl>
</section>
