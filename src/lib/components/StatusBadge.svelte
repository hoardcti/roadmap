<script>
	import Icon from './Icon.svelte';
	import { STATUS_META } from '$lib/data/roadmap.js';

	/** @type {{ status: import('$lib/data/roadmap.js').Status, size?: 'sm' | 'md', dotOnly?: boolean }} */
	let { status, size = 'md', dotOnly = false } = $props();

	const meta = $derived(STATUS_META[status] ?? STATUS_META.planned);
</script>

{#if dotOnly}
	<span
		data-status={status}
		class="inline-flex shrink-0 items-center justify-center"
		style="color: var(--status-fg)"
		title={meta.label}
	>
		<Icon name={meta.icon} size={size === 'sm' ? 14 : 16} />
		<span class="sr-only">{meta.label}</span>
	</span>
{:else}
	<span
		data-status={status}
		class="inline-flex shrink-0 items-center gap-1.5 rounded-full border font-medium whitespace-nowrap
			{size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'}"
		style="color: var(--status-fg); background: var(--status-bg); border-color: color-mix(in srgb, var(--status-fg) 22%, transparent)"
	>
		<Icon name={meta.icon} size={size === 'sm' ? 11 : 13} stroke={2} />
		{meta.label}
	</span>
{/if}
