<script>
	import { base } from '$app/paths';
	import Icon from './Icon.svelte';
	import StatusBadge from './StatusBadge.svelte';
	import { getRoadmap } from '$lib/data/roadmap.js';

	/** @type {{ item: import('$lib/data/roadmap.js').Item }} */
	let { item } = $props();

	const linked = $derived(item.link?.roadmap ? getRoadmap(item.link.roadmap) : undefined);
	const href = $derived(linked ? `${base}${linked.href}` : item.link?.url);
	const external = $derived(Boolean(item.link?.url && !linked));
</script>

<li class="flex gap-3 px-4 py-3.5 transition-colors hover:bg-panel-hover/60">
	<span class="mt-0.5">
		<StatusBadge status={item.status} dotOnly />
	</span>

	<div class="min-w-0 flex-1">
		<div class="flex flex-wrap items-center gap-x-2 gap-y-1">
			<span
				class="text-[13.5px] font-medium text-ink"
				class:line-through={item.status === 'done'}
				class:decoration-ink-faint={item.status === 'done'}
				class:decoration-1={item.status === 'done'}
			>
				{item.title}
			</span>
			{#each item.tags as tag (tag)}
				<span
					class="rounded border border-line bg-raised px-1.5 py-px font-mono text-[10.5px] text-ink-faint"
				>
					{tag}
				</span>
			{/each}
		</div>

		{#if item.description}
			<p class="mt-1 text-[13px] leading-relaxed text-ink-muted">{item.description}</p>
		{/if}

		{#if item.note}
			<p class="mt-1.5 flex items-start gap-1.5 text-[12.5px] text-ink-faint">
				<span class="mt-px shrink-0"><Icon name="info" size={12} /></span>
				{item.note}
			</p>
		{/if}

		{#if item.link && href}
			<a
				{href}
				target={external ? '_blank' : undefined}
				rel={external ? 'noreferrer' : undefined}
				class="mt-2 inline-flex items-center gap-1 text-[12.5px] font-medium text-ink-soft underline decoration-line-strong underline-offset-4 transition-colors hover:text-ink hover:decoration-ink-faint"
			>
				{item.link.label}
				<Icon name={external ? 'external-link' : 'arrow-right'} size={12} />
			</a>
		{/if}
	</div>
</li>
