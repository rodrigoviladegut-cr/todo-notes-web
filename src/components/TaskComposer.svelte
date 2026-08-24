<script lang="ts">
  let { oncreate }: { oncreate: (text: string) => void } = $props();

  let text = $state('');
  let error = $state('');

  function submit(event: SubmitEvent) {
    event.preventDefault();
    if (!text.trim()) {
      error = 'Write something you want to remember.';
      return;
    }

    try {
      oncreate(text);
      text = '';
      error = '';
    } catch (reason) {
      error = reason instanceof Error ? reason.message : 'That task could not be added.';
    }
  }
</script>

<form class="composer" onsubmit={submit} novalidate>
  <label for="new-task">What needs your attention?</label>
  <div class="composer-row">
    <input
      id="new-task"
      name="task"
      bind:value={text}
      aria-describedby={error ? 'new-task-error' : undefined}
      aria-invalid={error ? 'true' : undefined}
      placeholder="Write the next small thing..."
      autocomplete="off"
    />
    <button class="primary" type="submit">Add note</button>
  </div>
  {#if error}
    <p class="field-error" id="new-task-error">{error}</p>
  {/if}
</form>
