<script>
	/** @type {{ percent: number, label?: string, showLabel?: boolean }} */
	let { percent, label, showLabel = true } = $props();

	const clamped = $derived(Math.max(0, Math.min(100, Math.round(percent))));
</script>

<div class="w-full">
	{#if showLabel}
		<div class="mb-1.5 flex items-baseline justify-between gap-3 text-xs">
			<span class="text-ink-muted">{label ?? 'Progress'}</span>
			<span class="font-medium text-ink-soft tabular-nums">{clamped}%</span>
		</div>
	{/if}
	<div
		class="h-1.5 w-full overflow-hidden rounded-full bg-line"
		role="progressbar"
		aria-valuenow={clamped}
		aria-valuemin="0"
		aria-valuemax="100"
		aria-label={label ?? 'Progress'}
	>
		<div
			class="h-full rounded-full bg-brand transition-[width] duration-500 ease-out"
			style="width: {clamped}%"
		></div>
	</div>
</div>
