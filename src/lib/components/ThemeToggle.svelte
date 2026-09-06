<script>
	import Icon from './Icon.svelte';
	import { theme } from '$lib/theme.svelte.js';
</script>

<div
	class="flex items-center gap-0.5 rounded-full border border-line bg-panel p-0.5"
	role="group"
	aria-label="Colour theme"
>
	<button
		type="button"
		class="rounded-full p-1.5 transition-colors"
		class:bg-raised={theme.value === 'light'}
		class:shadow-sm={theme.value === 'light'}
		class:text-ink={theme.value === 'light'}
		class:text-ink-faint={theme.value !== 'light'}
		aria-pressed={theme.value === 'light'}
		title="Light theme"
		onclick={() => theme.set('light')}
	>
		<Icon name="sun" size={14} />
		<span class="sr-only">Light theme</span>
	</button>
	<button
		type="button"
		class="rounded-full p-1.5 transition-colors"
		class:bg-raised={theme.value === 'dark'}
		class:text-ink={theme.value === 'dark'}
		class:text-ink-faint={theme.value !== 'dark'}
		aria-pressed={theme.value === 'dark'}
		title="Dark theme"
		onclick={() => theme.set('dark')}
	>
		<Icon name="moon" size={14} />
		<span class="sr-only">Dark theme</span>
	</button>
</div>
