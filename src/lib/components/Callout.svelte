<script>
	import Icon from './Icon.svelte';

	/** @type {{ type?: 'info' | 'warning' | 'success', title?: string, body?: string, children?: import('svelte').Snippet }} */
	let { type = 'info', title, body, children } = $props();

	const tone = $derived(
		{
			info: { icon: 'info', color: 'var(--status-active)' },
			warning: { icon: 'alert-triangle', color: 'var(--status-blocked)' },
			success: { icon: 'circle-check', color: 'var(--status-done)' }
		}[type] ?? { icon: 'info', color: 'var(--status-active)' }
	);
</script>

<div
	class="flex gap-3 rounded-lg rounded-l-sm border border-l-2 border-line bg-panel px-4 py-3.5"
	style="border-left-color: {tone.color}"
>
	<span class="mt-0.5 shrink-0" style="color: {tone.color}">
		<Icon name={tone.icon} size={16} />
	</span>
	<div class="min-w-0 text-sm">
		{#if title}
			<p class="font-semibold text-ink">{title}</p>
		{/if}
		{#if body}
			<p class="mt-1 leading-relaxed text-ink-muted">{body}</p>
		{/if}
		{#if children}
			<div class="mt-1 leading-relaxed text-ink-muted">{@render children()}</div>
		{/if}
	</div>
</div>
