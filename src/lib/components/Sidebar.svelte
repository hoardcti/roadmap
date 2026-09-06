<script>
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import Icon from './Icon.svelte';
	import Logo from './Logo.svelte';
	import ThemeToggle from './ThemeToggle.svelte';
	import { groupedSubRoadmaps, mainRoadmap, meta } from '$lib/data/roadmap.js';

	/** @type {{ onCollapse: () => void, onSearch: () => void, onNavigate?: () => void }} */
	let { onCollapse, onSearch, onNavigate } = $props();

	/** Trailing slashes vary between dev, prerender and Pages — normalise before comparing. */
	const norm = (/** @type {string} */ path) => path.replace(/\/+$/, '') || '/';
	const currentPath = $derived(norm(page.url.pathname));

	/** @param {string} href */
	function isActive(href) {
		return norm(`${base}${href}`) === currentPath;
	}
</script>

<div class="flex h-full flex-col bg-rail">
	<!-- Brand -->
	<div class="flex items-center justify-between gap-2 px-4 pt-4 pb-3">
		<a
			href="{base}/"
			class="flex items-center gap-2.5 rounded-md text-[15px] font-semibold text-ink"
			onclick={onNavigate}
		>
			<span
				class="flex size-7 items-center justify-center rounded-md border border-line bg-raised text-brand"
			>
				<Logo size={15} />
			</span>
			{meta.name}
		</a>
		<button
			type="button"
			class="rounded-md p-1.5 text-ink-faint transition-colors hover:bg-active hover:text-ink-soft"
			onclick={onCollapse}
			title="Collapse sidebar"
		>
			<Icon name="panel-left" size={16} />
			<span class="sr-only">Collapse sidebar</span>
		</button>
	</div>

	<!-- Search -->
	<div class="px-4 pb-4">
		<button
			type="button"
			class="flex w-full items-center gap-2 rounded-lg border border-line bg-raised px-3 py-2 text-[13px] text-ink-faint transition-colors hover:border-line-strong hover:text-ink-muted"
			onclick={onSearch}
		>
			<Icon name="search" size={14} />
			<span>Search</span>
			<kbd
				class="ml-auto flex items-center gap-0.5 rounded border border-line bg-panel px-1.5 py-0.5 font-mono text-[10px] text-ink-faint"
			>
				Ctrl K
			</kbd>
		</button>
	</div>

	<!-- Navigation -->
	<nav class="scrollbar-thin flex-1 overflow-y-auto px-3 pb-4" aria-label="Roadmaps">
		{#if mainRoadmap}
			<a
				href="{base}{mainRoadmap.href}"
				class="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] transition-colors
					{isActive(mainRoadmap.href)
					? 'bg-active font-medium text-ink'
					: 'text-ink-muted hover:bg-active/60 hover:text-ink-soft'}"
				aria-current={isActive(mainRoadmap.href) ? 'page' : undefined}
				onclick={onNavigate}
			>
				<Icon name={mainRoadmap.icon} size={15} />
				{mainRoadmap.title}
			</a>
		{/if}

		{#each groupedSubRoadmaps as group (group.name)}
			<p class="px-3 pt-6 pb-2 text-[12px] font-medium text-ink-faint">{group.name}</p>
			{#each group.roadmaps as roadmap (roadmap.id)}
				<a
					href="{base}{roadmap.href}"
					class="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] transition-colors
						{isActive(roadmap.href)
						? 'bg-active font-medium text-ink'
						: 'text-ink-muted hover:bg-active/60 hover:text-ink-soft'}"
					aria-current={isActive(roadmap.href) ? 'page' : undefined}
					onclick={onNavigate}
				>
					<Icon name={roadmap.icon} size={15} />
					{roadmap.title}
				</a>
			{/each}
		{/each}
	</nav>

	<!-- Footer -->
	<div class="flex items-center justify-between gap-2 border-t border-line px-4 py-3">
		{#if meta.github}
			<a
				href={meta.github}
				target="_blank"
				rel="noreferrer"
				class="rounded-md p-1.5 text-ink-faint transition-colors hover:bg-active hover:text-ink"
				title="GitHub"
			>
				<Icon name="github" size={16} />
				<span class="sr-only">GitHub</span>
			</a>
		{:else}
			<span></span>
		{/if}
		<ThemeToggle />
	</div>
</div>
