<script module>
	/**
	 * Inline icon set (lucide-flavoured) so the site ships zero icon dependencies.
	 * Every entry is an array of <path>/<circle>/<line> descriptors.
	 * @type {Record<string, { d?: string, circle?: [number, number, number], line?: [number, number, number, number], fill?: boolean, dash?: string }[]>}
	 */
	export const icons = {
		rocket: [
			{
				d: 'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91 0z'
			},
			{ d: 'M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z' },
			{ d: 'M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0' },
			{ d: 'M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5' }
		],
		database: [
			{ d: 'M3 5c0-1.66 4.03-3 9-3s9 1.34 9 3-4.03 3-9 3-9-1.34-9-3z' },
			{ d: 'M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5' },
			{ d: 'M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3' }
		],
		inbox: [
			{ d: 'M22 12h-6l-2 3h-4l-2-3H2' },
			{
				d: 'M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z'
			}
		],
		'git-branch': [
			{ line: [6, 3, 6, 15] },
			{ circle: [18, 6, 3] },
			{ circle: [6, 18, 3] },
			{ d: 'M18 9a9 9 0 0 1-9 9' }
		],
		cpu: [
			{ d: 'M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z' },
			{ d: 'M9 9h6v6H9z' },
			{ d: 'M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3' }
		],
		zap: [{ d: 'M13 2 3 14h9l-1 8 10-12h-9l1-8z' }],
		layers: [
			{ d: 'm12 2 9 5-9 5-9-5z' },
			{ d: 'm3 12 9 5 9-5' },
			{ d: 'm3 17 9 5 9-5' }
		],
		box: [{ d: 'm21 16-9 5-9-5V8l9-5 9 5z' }, { d: 'm3.3 7 8.7 5 8.7-5' }, { d: 'M12 22V12' }],
		code: [{ d: 'm16 18 6-6-6-6' }, { d: 'm8 6-6 6 6 6' }],
		briefcase: [
			{ d: 'M2 9a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z' },
			{ d: 'M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16' }
		],
		search: [{ circle: [11, 11, 8] }, { d: 'm21 21-4.35-4.35' }],
		sun: [
			{ circle: [12, 12, 4] },
			{
				d: 'M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41'
			}
		],
		moon: [{ d: 'M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z' }],
		github: [
			{
				fill: true,
				d: 'M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.2 11.38.6.11.82-.26.82-.58 0-.28-.01-1.02-.02-2-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.82 1.1.82 2.22 0 1.61-.02 2.9-.02 3.29 0 .32.22.7.83.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z'
			}
		],
		'panel-left': [
			{ d: 'M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
			{ d: 'M9 3v18' }
		],
		'chevron-right': [{ d: 'm9 18 6-6-6-6' }],
		'chevron-down': [{ d: 'm6 9 6 6 6-6' }],
		'arrow-right': [{ d: 'M5 12h14' }, { d: 'm12 5 7 7-7 7' }],
		'arrow-left': [{ d: 'M19 12H5' }, { d: 'm12 19-7-7 7-7' }],
		'external-link': [
			{ d: 'M15 3h6v6' },
			{ d: 'M10 14 21 3' },
			{ d: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6' }
		],
		'circle-check': [{ circle: [12, 12, 9] }, { d: 'm8.5 12 2.5 2.5 4.5-5' }],
		'circle-dot': [{ circle: [12, 12, 9] }, { circle: [12, 12, 3], fill: true }],
		'circle-dashed': [{ circle: [12, 12, 9], dash: '3.2 3.2' }],
		'circle-pause': [{ circle: [12, 12, 9] }, { d: 'M10 9v6M14 9v6' }],
		info: [{ circle: [12, 12, 9] }, { d: 'M12 11v5' }, { d: 'M12 7.75h.01' }],
		'alert-triangle': [
			{ d: 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' },
			{ d: 'M12 9v4' },
			{ d: 'M12 17h.01' }
		],
		calendar: [
			{ d: 'M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z' },
			{ d: 'M16 2v4M8 2v4M3 10h18' }
		],
		hash: [{ d: 'M4 9h16M4 15h16M10 3 8 21M16 3l-2 18' }],
		x: [{ d: 'M18 6 6 18M6 6l12 12' }],
		'corner-down-left': [{ d: 'M20 4v7a4 4 0 0 1-4 4H4' }, { d: 'm9 10-5 5 5 5' }]
	};
</script>

<script>
	/**
	 * @type {{ name: string, size?: number, stroke?: number, class?: string }}
	 */
	let { name, size = 16, stroke = 1.75, class: className = '' } = $props();

	const parts = $derived(icons[name] ?? icons.box);
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 24 24"
	width={size}
	height={size}
	fill="none"
	stroke="currentColor"
	stroke-width={stroke}
	stroke-linecap="round"
	stroke-linejoin="round"
	class={className}
	aria-hidden="true"
>
	{#each parts as part (part.d ?? part.circle ?? part.line)}
		{#if part.d}
			<path d={part.d} fill={part.fill ? 'currentColor' : 'none'} stroke={part.fill ? 'none' : 'currentColor'} />
		{:else if part.circle}
			<circle
				cx={part.circle[0]}
				cy={part.circle[1]}
				r={part.circle[2]}
				fill={part.fill ? 'currentColor' : 'none'}
				stroke={part.fill ? 'none' : 'currentColor'}
				stroke-dasharray={part.dash}
			/>
		{:else if part.line}
			<line x1={part.line[0]} y1={part.line[1]} x2={part.line[2]} y2={part.line[3]} />
		{/if}
	{/each}
</svg>
