import { error } from '@sveltejs/kit';
import { mainRoadmap, meta, tocFor } from '$lib/data/roadmap.js';

export function load() {
	if (!mainRoadmap) error(500, 'roadmap.json contains no roadmaps');

	return {
		roadmap: mainRoadmap,
		toc: tocFor(mainRoadmap),
		title: mainRoadmap.title,
		description: mainRoadmap.summary ?? meta.description
	};
}
