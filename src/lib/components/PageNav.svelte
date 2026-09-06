<script>
	import { base } from '$app/paths';
	import Icon from './Icon.svelte';

	/** @type {{ prev?: import('$lib/data/roadmap.js').Roadmap, next?: import('$lib/data/roadmap.js').Roadmap }} */
	let { prev, next } = $props();
</script>

{#if prev || next}
	<nav class="mt-14 grid gap-4 border-t border-line pt-8 sm:grid-cols-2">
		{#if prev}
			<a
				href="{base}{prev.href}"
				class="group rounded-xl border border-line bg-panel px-5 py-4 transition-colors hover:border-line-strong hover:bg-panel-hover sm:col-start-1"
			>
				<p class="flex items-center gap-1.5 font-semibold text-ink">
					<span
						class="text-ink-faint transition-transform group-hover:-translate-x-0.5"
						aria-hidden="true"
					>
						<Icon name="chevron-right" size={14} class="rotate-180" />
					</span>
					{prev.title}
				</p>
				{#if prev.summary}
					<p class="mt-1 line-clamp-2 text-[13px] text-ink-muted">{prev.summary}</p>
				{/if}
			</a>
		{/if}

		{#if next}
			<a
				href="{base}{next.href}"
				class="group rounded-xl border border-line bg-panel px-5 py-4 text-right transition-colors hover:border-line-strong hover:bg-panel-hover sm:col-start-2"
			>
				<p class="flex items-center justify-end gap-1.5 font-semibold text-ink">
					{next.title}
					<span
						class="text-ink-faint transition-transform group-hover:translate-x-0.5"
						aria-hidden="true"
					>
						<Icon name="chevron-right" size={14} />
					</span>
				</p>
				{#if next.summary}
					<p class="mt-1 line-clamp-2 text-[13px] text-ink-muted">{next.summary}</p>
				{/if}
			</a>
		{/if}
	</nav>
{/if}
