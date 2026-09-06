<script>
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import Icon from '$lib/components/Icon.svelte';
</script>

<div class="flex flex-col items-start gap-4 py-16">
	<p class="font-mono text-sm text-ink-faint">{page.status}</p>
	<h1 class="text-3xl font-bold tracking-tight text-ink">
		{page.status === 404 ? 'Roadmap not found' : 'Something went wrong'}
	</h1>
	<p class="max-w-prose text-[15px] leading-relaxed text-ink-muted">
		{page.error?.message ?? 'The page you were looking for is not part of this roadmap.'}
	</p>
	<a
		href="{base}/"
		class="mt-2 inline-flex items-center gap-2 rounded-lg border border-line bg-panel px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-panel-hover"
	>
		<Icon name="arrow-left" size={14} />
		Back to the roadmap
	</a>
</div>
