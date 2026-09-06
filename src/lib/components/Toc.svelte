<script>
	import Icon from './Icon.svelte';

	/** @type {{ headings: { id: string, title: string }[] }} */
	let { headings } = $props();

	let activeId = $state(headings[0]?.id ?? '');

	$effect(() => {
		// Re-runs when the heading list changes (i.e. on navigation).
		const ids = headings.map((h) => h.id);
		activeId = ids[0] ?? '';

		const elements = ids
			.map((id) => document.getElementById(id))
			.filter((el) => el instanceof HTMLElement);
		if (elements.length === 0) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((e) => e.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
				if (visible[0]) activeId = visible[0].target.id;
			},
			{ rootMargin: '-80px 0px -65% 0px', threshold: 0 }
		);

		for (const el of elements) observer.observe(el);
		return () => observer.disconnect();
	});
</script>

{#if headings.length > 0}
	<nav aria-label="On this page" class="text-[13px]">
		<p class="mb-3 flex items-center gap-2 font-medium text-ink-soft">
			<Icon name="hash" size={13} />
			On this page
		</p>
		<ul class="border-l border-line">
			{#each headings as heading (heading.id)}
				<li>
					<a
						href="#{heading.id}"
						class="-ml-px block border-l py-1.5 pl-3 transition-colors
							{activeId === heading.id
							? 'border-ink text-ink font-medium'
							: 'border-transparent text-ink-muted hover:text-ink-soft'}"
						aria-current={activeId === heading.id ? 'location' : undefined}
					>
						{heading.title}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
{/if}
