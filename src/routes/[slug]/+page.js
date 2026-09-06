import { error } from '@sveltejs/kit';
import { getRoadmap, subRoadmaps, tocFor } from '$lib/data/roadmap.js';

/** Tells the prerenderer which sub-roadmaps exist, without relying on crawling. */
export function entries() {
	return subRoadmaps.map((roadmap) => ({ slug: roadmap.id }));
}

/** @param {{ params: { slug: string } }} event */
export function load({ params }) {
	const roadmap = getRoadmap(params.slug);
	if (!roadmap || roadmap.main) error(404, 'Roadmap not found');

	return {
		roadmap,
		toc: tocFor(roadmap),
		title: roadmap.title,
		description: roadmap.summary
	};
}
