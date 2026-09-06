<script>
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import Icon from './Icon.svelte';
	import StatusBadge from './StatusBadge.svelte';
	import { searchIndex } from '$lib/data/roadmap.js';

	/** @type {{ open: boolean, onClose: () => void }} */
	let { open, onClose } = $props();

	let query = $state('');
	let selected = $state(0);
	/** @type {HTMLInputElement | undefined} */
	let input = $state();

	const results = $derived.by(() => {
		const q = query.trim().toLowerCase();
		const pool = q
			? searchIndex.filter((entry) =>
					`${entry.title} ${entry.context} ${entry.description}`.toLowerCase().includes(q)
				)
			: searchIndex.filter((entry) => entry.type !== 'item');
		return pool.slice(0, 24);
	});

	$effect(() => {
		if (open) {
			query = '';
			selected = 0;
			queueMicrotask(() => input?.focus());
		}
	});

	$effect(() => {
		// Keep the highlighted row inside the list when the query changes.
		void results;
		selected = 0;
	});

	/** @param {string} href */
	async function open_(href) {
		onClose();
		await goto(`${base}${href}`);
	}

	/** @param {KeyboardEvent} event */
	function onkeydown(event) {
		if (event.key === 'Escape') {
			event.preventDefault();
			onClose();
		} else if (event.key === 'ArrowDown') {
			event.preventDefault();
			selected = (selected + 1) % Math.max(results.length, 1);
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			selected = (selected - 1 + results.length) % Math.max(results.length, 1);
		} else if (event.key === 'Enter') {
			event.preventDefault();
			const result = results[selected];
			if (result) open_(result.href);
		}
	}
</script>

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-[12vh] backdrop-blur-[2px]"
		onclick={(event) => event.target === event.currentTarget && onClose()}
	>
		<div
			class="flex max-h-[70vh] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-line bg-canvas shadow-2xl"
			role="dialog"
			aria-modal="true"
			aria-label="Search the roadmap"
		>
			<div class="flex items-center gap-3 border-b border-line px-4">
				<span class="text-ink-faint"><Icon name="search" size={16} /></span>
				<!-- svelte-ignore a11y_autofocus -->
				<input
					bind:this={input}
					bind:value={query}
					{onkeydown}
					type="text"
					placeholder="Search milestones and work items…"
					class="flex-1 bg-transparent py-3.5 text-sm text-ink outline-none placeholder:text-ink-faint"
					autocomplete="off"
					spellcheck="false"
				/>
				<button
					type="button"
					class="rounded-md p-1 text-ink-faint transition-colors hover:text-ink"
					onclick={onClose}
					title="Close"
				>
					<Icon name="x" size={15} />
					<span class="sr-only">Close search</span>
				</button>
			</div>

			<div class="scrollbar-thin flex-1 overflow-y-auto p-2">
				{#if results.length === 0}
					<p class="px-3 py-8 text-center text-sm text-ink-muted">
						No matches for “{query}”.
					</p>
				{:else}
					<ul>
						{#each results as result, index (result.id)}
							<li>
								<button
									type="button"
									class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors
										{index === selected ? 'bg-active' : 'hover:bg-panel'}"
									onclick={() => open_(result.href)}
									onmouseenter={() => (selected = index)}
								>
									<span class="text-ink-faint">
										<Icon
											name={result.type === 'roadmap'
												? 'layers'
												: result.type === 'milestone'
													? 'calendar'
													: 'hash'}
											size={14}
										/>
									</span>
									<span class="min-w-0 flex-1">
										<span class="block truncate text-[13.5px] font-medium text-ink">
											{result.title}
										</span>
										<span class="block truncate text-[12px] text-ink-faint">{result.context}</span>
									</span>
									<StatusBadge status={result.status} size="sm" dotOnly />
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			</div>

			<div
				class="flex items-center gap-4 border-t border-line px-4 py-2 text-[11px] text-ink-faint"
			>
				<span class="flex items-center gap-1.5">
					<kbd class="rounded border border-line bg-panel px-1 py-px font-mono">↑↓</kbd> navigate
				</span>
				<span class="flex items-center gap-1.5">
					<kbd class="rounded border border-line bg-panel px-1 py-px font-mono">↵</kbd> open
				</span>
				<span class="flex items-center gap-1.5">
					<kbd class="rounded border border-line bg-panel px-1 py-px font-mono">esc</kbd> close
				</span>
			</div>
		</div>
	</div>
{/if}
