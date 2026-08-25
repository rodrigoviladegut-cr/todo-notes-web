<script lang="ts">
  import type { Theme } from '../lib/task-model';

  let { theme, ontoggle }: { theme: Theme; ontoggle: (theme: Theme) => void } = $props();

  let darkTheme = $derived(theme === 'dark');
</script>

<button
  class="theme-toggle"
  type="button"
  aria-pressed={darkTheme}
  onclick={() => ontoggle(darkTheme ? 'light' : 'dark')}
>
  Dark theme: {darkTheme ? 'on' : 'off'}
</button>
