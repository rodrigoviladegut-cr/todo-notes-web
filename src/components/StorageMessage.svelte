<script lang="ts">
  let { message, ondismiss }: { message: string; ondismiss: () => void } = $props();
</script>

{#if message}
  <aside class="storage-message" role="alert">
    <p>{message}</p>
    <button class="quiet small" type="button" onclick={ondismiss}>Dismiss</button>
  </aside>
{/if}
