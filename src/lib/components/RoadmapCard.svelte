<script>
	import { base } from '$app/paths';
	import Icon from './Icon.svelte';
	import ProgressBar from './ProgressBar.svelte';
	import StatusBadge from './StatusBadge.svelte';
	import { progressOf } from '$lib/data/roadmap.js';

	/** @type {{ roadmap: import('$lib/data/roadmap.js').Roadmap }} */
	let { roadmap } = $props();

	const progress = $derived(progressOf(roadmap));
</script>

<a
	href="{base}{roadmap.href}"
	class="group flex flex-col gap-3 rounded-xl border border-line bg-panel p-5 transition-all hover:border-line-strong hover:bg-panel-hover"
>
	<div class="flex items-start justify-between gap-3">
		<span
			class="flex size-8 items-center justify-center rounded-lg border border-line bg-raised text-ink-soft"
		>
			<Icon name={roadmap.icon} size={15} />
		</span>
		<StatusBadge status={roadmap.status} size="sm" />
	</div>

	<div>
		<h3 class="flex items-center gap-1.5 text-[15px] font-semibold text-ink">
			{roadmap.title}
			<span
				class="text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-ink-muted"
			>
				<Icon name="chevron-right" size={14} />
			</span>
		</h3>
		{#if roadmap.summary}
			<p class="mt-1.5 text-[13px] leading-relaxed text-ink-muted">{roadmap.summary}</p>
		{/if}
	</div>

	<div class="mt-auto pt-1">
		<ProgressBar
			percent={progress.percent}
			label="{progress.done}/{progress.total} shipped"
		/>
	</div>
</a>
