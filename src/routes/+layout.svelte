<script>
	import '../app.css';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { base } from '$app/paths';
	import Icon from '$lib/components/Icon.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import SearchDialog from '$lib/components/SearchDialog.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import Toc from '$lib/components/Toc.svelte';
	import { meta } from '$lib/data/roadmap.js';
	import { theme } from '$lib/theme.svelte.js';

	let { children } = $props();

	let sidebarOpen = $state(true); // desktop rail
	let mobileOpen = $state(false);
	let searchOpen = $state(false);

	const toc = $derived(
		/** @type {{ id: string, title: string }[]} */ (page.data?.toc ?? [])
	);

	onMount(() => {
		theme.sync();

		/** @param {KeyboardEvent} event */
		const onKey = (event) => {
			if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
				event.preventDefault();
				searchOpen = !searchOpen;
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});
</script>

<svelte:head>
	<title>{page.data?.title ? `${page.data.title} · ${meta.name}` : `${meta.name} ${meta.tagline}`}</title>
	<meta name="description" content={page.data?.description ?? meta.description} />
</svelte:head>

<div class="flex min-h-full">
	<!-- Desktop sidebar -->
	<aside
		class="fixed inset-y-0 left-0 z-30 hidden w-[280px] border-r border-line lg:block {sidebarOpen
			? ''
			: 'lg:hidden'}"
	>
		<Sidebar
			onCollapse={() => (sidebarOpen = false)}
			onSearch={() => (searchOpen = true)}
		/>
	</aside>

	<!-- Mobile sidebar -->
	{#if mobileOpen}
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
		<div
			class="fixed inset-0 z-40 bg-black/40 lg:hidden"
			onclick={() => (mobileOpen = false)}
		></div>
		<aside class="fixed inset-y-0 left-0 z-50 w-[280px] border-r border-line lg:hidden">
			<Sidebar
				onCollapse={() => (mobileOpen = false)}
				onSearch={() => {
					mobileOpen = false;
					searchOpen = true;
				}}
				onNavigate={() => (mobileOpen = false)}
			/>
		</aside>
	{/if}

	<!-- Content -->
	<div class="flex min-w-0 flex-1 flex-col {sidebarOpen ? 'lg:pl-[280px]' : ''}">
		<!-- Top bar (mobile + collapsed desktop) -->
		<header
			class="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-canvas/85 px-4 py-3 backdrop-blur-sm {sidebarOpen
				? 'lg:hidden'
				: ''}"
		>
			<button
				type="button"
				class="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-active hover:text-ink lg:hidden"
				onclick={() => (mobileOpen = true)}
				title="Open navigation"
			>
				<Icon name="panel-left" size={17} />
				<span class="sr-only">Open navigation</span>
			</button>
			<button
				type="button"
				class="hidden rounded-md p-1.5 text-ink-muted transition-colors hover:bg-active hover:text-ink lg:block"
				onclick={() => (sidebarOpen = true)}
				title="Expand sidebar"
			>
				<Icon name="panel-left" size={17} />
				<span class="sr-only">Expand sidebar</span>
			</button>

			<a href="{base}/" class="flex items-center gap-2 text-sm font-semibold text-ink">
				<span
					class="flex size-6 items-center justify-center rounded-md border border-line bg-panel text-brand"
				>
					<Logo size={13} />
				</span>
				{meta.name}
			</a>

			<button
				type="button"
				class="ml-auto rounded-md p-1.5 text-ink-muted transition-colors hover:bg-active hover:text-ink"
				onclick={() => (searchOpen = true)}
				title="Search"
			>
				<Icon name="search" size={16} />
				<span class="sr-only">Search</span>
			</button>
		</header>

		<div class="mx-auto flex w-full max-w-[1180px] flex-1 gap-10 px-5 py-10 sm:px-8 lg:px-12">
			<main class="min-w-0 flex-1 pb-16">
				{@render children()}
			</main>

			<!-- On this page -->
			{#if toc.length > 0}
				<div class="hidden w-[210px] shrink-0 xl:block">
					<div class="sticky top-10 max-h-[calc(100vh-5rem)] overflow-y-auto pb-10">
						<Toc headings={toc} />
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<SearchDialog open={searchOpen} onClose={() => (searchOpen = false)} />
