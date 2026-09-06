<script>
	/** A shield holding a stacked hoard — the site mark. */
	/** @type {{ size?: number, class?: string }} */
	let { size = 16, class: className = '' } = $props();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 24 24"
	width={size}
	height={size}
	fill="none"
	stroke="currentColor"
	stroke-width="1.75"
	stroke-linecap="round"
	stroke-linejoin="round"
	class={className}
	aria-hidden="true"
>
	<path
		d="M20 12.5c0 4.7-3.4 7.2-7.6 8.5a1.3 1.3 0 0 1-.8 0C7.4 19.7 4 17.2 4 12.5V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.6a1.2 1.2 0 0 1 1.6 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z"
	/>
	<path d="M8.5 14.5h7" />
	<path d="M9.75 11h4.5" />
	<path d="M11 7.5h2" />
</svg>
