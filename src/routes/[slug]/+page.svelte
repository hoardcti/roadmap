<script>
	import RoadmapView from '$lib/components/RoadmapView.svelte';

	let { data } = $props();
</script>

<RoadmapView roadmap={data.roadmap} />
