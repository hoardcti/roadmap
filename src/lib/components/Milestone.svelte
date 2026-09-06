<script>
	import Icon from './Icon.svelte';
	import ItemRow from './ItemRow.svelte';
	import StatusBadge from './StatusBadge.svelte';

	/** @type {{ milestone: import('$lib/data/roadmap.js').Milestone, last?: boolean }} */
	let { milestone, last = false } = $props();
</script>

<section class="relative pb-10 pl-8 last:pb-0" id={milestone.id} data-toc-heading>
	<!-- Timeline rail -->
	{#if !last}
		<span aria-hidden="true" class="absolute top-6 bottom-0 left-[7px] w-px bg-line"></span>
	{/if}
	<span
		aria-hidden="true"
		data-status={milestone.status}
		class="absolute top-[7px] left-0 flex size-[15px] items-center justify-center rounded-full border-2 bg-canvas"
		style="border-color: var(--status-fg); background: {milestone.status === 'planned'
			? 'var(--canvas)'
			: 'var(--status-fg)'}"
	></span>

	<header class="mb-4">
		<div class="flex flex-wrap items-center gap-x-3 gap-y-2">
			<h2 class="scroll-mt-24 text-lg font-semibold tracking-tight text-ink">
				<a href="#{milestone.id}" class="group inline-flex items-center gap-2">
					{milestone.title}
					<span
						class="text-ink-faint opacity-0 transition-opacity group-hover:opacity-100"
						aria-hidden="true"
					>
						<Icon name="hash" size={13} />
					</span>
				</a>
			</h2>
			<StatusBadge status={milestone.status} size="sm" />
			{#if milestone.target}
				<span class="inline-flex items-center gap-1.5 text-xs text-ink-faint">
					<Icon name="calendar" size={12} />
					{milestone.target}
				</span>
			{/if}
		</div>
		{#if milestone.description}
			<p class="mt-2 text-sm leading-relaxed text-ink-muted">{milestone.description}</p>
		{/if}
	</header>

	{#if milestone.items.length > 0}
		<ul class="divide-y divide-line overflow-hidden rounded-xl border border-line bg-panel">
			{#each milestone.items as item (item.id)}
				<ItemRow {item} />
			{/each}
		</ul>
	{/if}
</section>
