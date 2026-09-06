import raw from './roadmap.json';

/**
 * @typedef {'done' | 'in-progress' | 'planned' | 'blocked'} Status
 *
 * @typedef {object} Item
 * @property {string} id
 * @property {string} title
 * @property {string} [description]
 * @property {Status} status
 * @property {string[]} tags
 * @property {string} [note]
 * @property {{ label: string, url?: string, roadmap?: string }} [link]
 *
 * @typedef {object} Milestone
 * @property {string} id
 * @property {string} title
 * @property {string} [description]
 * @property {Status} status
 * @property {string} [target]
 * @property {Item[]} items
 *
 * @typedef {object} Roadmap
 * @property {string} id
 * @property {string} title
 * @property {string} [summary]
 * @property {string} icon
 * @property {string} [group]
 * @property {boolean} main
 * @property {Status} status
 * @property {string} href
 * @property {{ name: string, url: string }} [repo]
 * @property {{ heading?: string, body?: string, callout?: { type?: string, title?: string, body: string } }} [intro]
 * @property {Milestone[]} milestones
 */

/** @type {Status[]} */
export const STATUSES = ['done', 'in-progress', 'planned', 'blocked'];

/** @type {Record<Status, { label: string, icon: string }>} */
export const STATUS_META = {
	done: { label: 'Shipped', icon: 'circle-check' },
	'in-progress': { label: 'In progress', icon: 'circle-dot' },
	planned: { label: 'Planned', icon: 'circle-dashed' },
	blocked: { label: 'Blocked', icon: 'circle-pause' }
};

/**
 * The JSON file is written by automation, so every field is treated as
 * untrusted: unknown statuses fall back to `planned`, missing arrays to `[]`.
 *
 * @param {unknown} value
 * @returns {Status}
 */
function toStatus(value) {
	return STATUSES.includes(/** @type {Status} */ (value))
		? /** @type {Status} */ (value)
		: 'planned';
}

/**
 * @param {string} value
 * @returns {string}
 */
function slugify(value) {
	return String(value)
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/** @param {any} item @param {number} index */
function normaliseItem(item, index) {
	return {
		id: slugify(item?.id ?? item?.title ?? `item-${index}`),
		title: String(item?.title ?? 'Untitled'),
		description: item?.description ? String(item.description) : undefined,
		status: toStatus(item?.status),
		tags: Array.isArray(item?.tags) ? item.tags.map(String) : [],
		note: item?.note ? String(item.note) : undefined,
		link: item?.link?.label ? item.link : undefined
	};
}

/** @param {any} milestone @param {number} index */
function normaliseMilestone(milestone, index) {
	const items = (Array.isArray(milestone?.items) ? milestone.items : []).map(normaliseItem);
	return {
		id: slugify(milestone?.id ?? milestone?.title ?? `milestone-${index}`),
		title: String(milestone?.title ?? 'Untitled milestone'),
		description: milestone?.description ? String(milestone.description) : undefined,
		status: milestone?.status ? toStatus(milestone.status) : deriveStatus(items),
		target: milestone?.target ? String(milestone.target) : undefined,
		items
	};
}

/**
 * A milestone with no explicit status inherits one from its items.
 * @param {{ status: Status }[]} items
 * @returns {Status}
 */
function deriveStatus(items) {
	if (items.length === 0) return 'planned';
	if (items.every((i) => i.status === 'done')) return 'done';
	if (items.some((i) => i.status === 'in-progress' || i.status === 'done')) return 'in-progress';
	if (items.every((i) => i.status === 'blocked')) return 'blocked';
	return 'planned';
}

/** @param {any} roadmap @param {number} index */
function normaliseRoadmap(roadmap, index) {
	const id = slugify(roadmap?.id ?? roadmap?.title ?? `roadmap-${index}`);
	const milestones = (Array.isArray(roadmap?.milestones) ? roadmap.milestones : []).map(
		normaliseMilestone
	);
	const isMain = roadmap?.main === true || id === 'main';

	return /** @type {Roadmap} */ ({
		id,
		title: String(roadmap?.title ?? 'Untitled roadmap'),
		summary: roadmap?.summary ? String(roadmap.summary) : undefined,
		icon: String(roadmap?.icon ?? 'layers'),
		group: roadmap?.group ? String(roadmap.group) : undefined,
		main: isMain,
		status: roadmap?.status ? toStatus(roadmap.status) : deriveStatus(milestones),
		href: isMain ? '/' : `/${id}`,
		repo: roadmap?.repo?.url ? roadmap.repo : undefined,
		intro: roadmap?.intro ?? undefined,
		milestones
	});
}

export const meta = {
	name: String(raw?.meta?.name ?? 'Roadmap'),
	tagline: String(raw?.meta?.tagline ?? 'Roadmap'),
	description: String(raw?.meta?.description ?? ''),
	github: raw?.meta?.github ? String(raw.meta.github) : undefined,
	updatedAt: raw?.meta?.updatedAt ? String(raw.meta.updatedAt) : undefined
};

/** @type {Roadmap[]} */
export const roadmaps = (Array.isArray(raw?.roadmaps) ? raw.roadmaps : []).map(normaliseRoadmap);

/** @type {Roadmap | undefined} */
export const mainRoadmap = roadmaps.find((r) => r.main) ?? roadmaps[0];

/** Splintered roadmaps: everything that is not the programme-level one. */
export const subRoadmaps = roadmaps.filter((r) => r !== mainRoadmap);

/** Sub-roadmaps bucketed by their `group`, preserving first-seen order. */
export const groupedSubRoadmaps = (() => {
	/** @type {{ name: string, roadmaps: Roadmap[] }[]} */
	const groups = [];
	for (const roadmap of subRoadmaps) {
		const name = roadmap.group ?? 'Roadmaps';
		let group = groups.find((g) => g.name === name);
		if (!group) {
			group = { name, roadmaps: [] };
			groups.push(group);
		}
		group.roadmaps.push(roadmap);
	}
	return groups;
})();

/** @param {string} id */
export function getRoadmap(id) {
	return roadmaps.find((r) => r.id === id);
}

/**
 * Completion is weighted: shipped items count fully, in-progress items count
 * half, so a roadmap moves as work starts rather than only when it lands.
 * @param {Roadmap} roadmap
 */
export function progressOf(roadmap) {
	const items = roadmap.milestones.flatMap((m) => m.items);
	const total = items.length;
	const done = items.filter((i) => i.status === 'done').length;
	const active = items.filter((i) => i.status === 'in-progress').length;
	const percent = total === 0 ? 0 : Math.round(((done + active * 0.5) / total) * 100);
	return { total, done, active, percent };
}

/**
 * Right-hand "On this page" entries for a roadmap.
 * @param {Roadmap} roadmap
 */
export function tocFor(roadmap) {
	/** @type {{ id: string, title: string }[]} */
	const toc = [];
	if (roadmap.intro?.heading) toc.push({ id: 'overview', title: roadmap.intro.heading });
	if (roadmap.main && subRoadmaps.length > 0) {
		toc.push({ id: 'roadmaps', title: 'Splintered roadmaps' });
	}
	for (const milestone of roadmap.milestones) {
		toc.push({ id: milestone.id, title: milestone.title });
	}
	return toc;
}

/**
 * Previous/next roadmap in sidebar order, for the footer navigation.
 * @param {Roadmap} roadmap
 */
export function siblingsOf(roadmap) {
	const order = mainRoadmap ? [mainRoadmap, ...subRoadmaps] : subRoadmaps;
	const index = order.findIndex((r) => r.id === roadmap.id);
	return {
		prev: index > 0 ? order[index - 1] : undefined,
		next: index >= 0 && index < order.length - 1 ? order[index + 1] : undefined
	};
}

/** Flattened index used by the search dialog. */
export const searchIndex = roadmaps.flatMap((roadmap) => [
	{
		type: /** @type {const} */ ('roadmap'),
		id: roadmap.id,
		title: roadmap.title,
		context: roadmap.main ? 'Main roadmap' : (roadmap.group ?? 'Roadmap'),
		description: roadmap.summary ?? '',
		status: roadmap.status,
		href: roadmap.href
	},
	...roadmap.milestones.flatMap((milestone) => [
		{
			type: /** @type {const} */ ('milestone'),
			id: `${roadmap.id}-${milestone.id}`,
			title: milestone.title,
			context: roadmap.title,
			description: milestone.description ?? '',
			status: milestone.status,
			href: `${roadmap.href}#${milestone.id}`
		},
		...milestone.items.map((item) => ({
			type: /** @type {const} */ ('item'),
			id: `${roadmap.id}-${milestone.id}-${item.id}`,
			title: item.title,
			context: `${roadmap.title} › ${milestone.title}`,
			description: item.description ?? '',
			status: item.status,
			href: `${roadmap.href}#${milestone.id}`
		}))
	])
]);
