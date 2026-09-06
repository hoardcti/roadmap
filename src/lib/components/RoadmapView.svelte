<script>
	import Callout from './Callout.svelte';
	import Icon from './Icon.svelte';
	import Milestone from './Milestone.svelte';
	import PageNav from './PageNav.svelte';
	import ProgressBar from './ProgressBar.svelte';
	import RoadmapCard from './RoadmapCard.svelte';
	import StatusBadge from './StatusBadge.svelte';
	import { meta, progressOf, siblingsOf, subRoadmaps } from '$lib/data/roadmap.js';

	/** @type {{ roadmap: import('$lib/data/roadmap.js').Roadmap }} */
	let { roadmap } = $props();

	const progress = $derived(progressOf(roadmap));
	const siblings = $derived(siblingsOf(roadmap));
</script>

<article>
	<!-- Page header -->
	<header class="border-b border-line pb-7">
		<h1 class="text-[32px] leading-tight font-bold tracking-tight text-ink">
			{roadmap.title}
		</h1>
		{#if roadmap.summary}
			<p class="mt-3 text-[15px] leading-relaxed text-ink-muted">{roadmap.summary}</p>
		{/if}

		<div class="mt-5 flex flex-wrap items-center gap-3">
			<StatusBadge status={roadmap.status} />
			{#if roadmap.repo}
				<a
					href={roadmap.repo.url}
					target="_blank"
					rel="noreferrer"
					class="inline-flex items-center gap-1.5 rounded-full border border-line bg-panel px-3 py-1 text-xs font-medium text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
				>
					<Icon name="github" size={12} />
					{roadmap.repo.name}
				</a>
			{/if}
			{#if meta.updatedAt}
				<span class="inline-flex items-center gap-1.5 text-xs text-ink-faint">
					<Icon name="calendar" size={12} />
					Updated {meta.updatedAt}
				</span>
			{/if}
		</div>

		{#if progress.total > 0}
			<div class="mt-5 max-w-md">
				<ProgressBar
					percent={progress.percent}
					label="{progress.done} shipped · {progress.active} in progress · {progress.total} total"
				/>
			</div>
		{/if}
	</header>

	<!-- Intro -->
	{#if roadmap.intro}
		<section class="pt-8" id="overview" data-toc-heading={roadmap.intro.heading ? '' : undefined}>
			{#if roadmap.intro.heading}
				<h2 class="scroll-mt-24 text-xl font-semibold tracking-tight text-ink">
					{roadmap.intro.heading}
				</h2>
			{/if}
			{#if roadmap.intro.body}
				<p class="mt-3 text-[15px] leading-relaxed text-ink-soft">{roadmap.intro.body}</p>
			{/if}
			{#if roadmap.intro.callout}
				<div class="mt-5">
					<Callout
						type={roadmap.intro.callout.type ?? 'info'}
						title={roadmap.intro.callout.title}
						body={roadmap.intro.callout.body}
					/>
				</div>
			{/if}
		</section>
	{/if}

	<!-- Splintered roadmaps -->
	{#if roadmap.main && subRoadmaps.length > 0}
		<section class="pt-10" id="roadmaps" data-toc-heading>
			<h2 class="scroll-mt-24 text-xl font-semibold tracking-tight text-ink">
				Splintered roadmaps
			</h2>
			<p class="mt-2 text-sm leading-relaxed text-ink-muted">
				Each repository keeps its own roadmap. They roll up into the milestones below.
			</p>
			<div class="mt-5 grid gap-4 sm:grid-cols-2">
				{#each subRoadmaps as sub (sub.id)}
					<RoadmapCard roadmap={sub} />
				{/each}
			</div>
		</section>
	{/if}

	<!-- Milestones -->
	{#if roadmap.milestones.length > 0}
		<section class="pt-12">
			<h2 class="sr-only">Milestones</h2>
			<div>
				{#each roadmap.milestones as milestone, index (milestone.id)}
					<Milestone {milestone} last={index === roadmap.milestones.length - 1} />
				{/each}
			</div>
		</section>
	{:else}
		<p class="pt-10 text-sm text-ink-muted">No milestones have been published yet.</p>
	{/if}

	<PageNav prev={siblings.prev} next={siblings.next} />
</article>
