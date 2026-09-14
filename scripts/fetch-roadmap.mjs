#!/usr/bin/env node
// Builds src/lib/data/roadmap.json from GitHub. The hand-maintained
// roadmap.config.json says which roadmaps exist and which repo backs each one;
// everything about progress comes from GitHub:
//
//   repo milestone          -> roadmap milestone (due date -> target)
//   issue in that milestone -> item (labels -> tags)
//   org project "Status"    -> item status, falling back to issue state/labels
//
// Usage: node scripts/fetch-roadmap.mjs [--if-missing]
// Set GITHUB_TOKEN (or ROADMAP_TOKEN) to read project statuses and avoid the
// unauthenticated rate limit; without one, statuses come from issues alone.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const configPath = fileURLToPath(new URL('../src/lib/data/roadmap.config.json', import.meta.url));
const outputPath = fileURLToPath(new URL('../src/lib/data/roadmap.json', import.meta.url));

const API = 'https://api.github.com';
const token = process.env.ROADMAP_TOKEN || process.env.GITHUB_TOKEN;
// The Actions-issued GITHUB_TOKEN can't read org projects, so only a personal token is tried there.
const projectToken =
	process.env.ROADMAP_TOKEN || (process.env.GITHUB_ACTIONS ? undefined : process.env.GITHUB_TOKEN);
const STATUS_ORDER = ['done', 'in-progress', 'blocked', 'planned'];

if (process.argv.includes('--if-missing') && existsSync(outputPath)) {
	console.log('roadmap.json already exists, skipping fetch (run `npm run fetch-roadmap` to refresh).');
	process.exit(0);
}

const config = JSON.parse(readFileSync(configPath, 'utf8'));

try {
	const statuses = await fetchProjectStatuses(config.meta?.project);
	const roadmaps = [];
	for (const roadmap of config.roadmaps) {
		roadmaps.push({ ...roadmap, milestones: await fetchMilestones(roadmap, statuses) });
	}

	const { project, ...meta } = config.meta ?? {};
	const output = { meta: { ...meta, updatedAt: new Date().toISOString().slice(0, 10) }, roadmaps };
	writeFileSync(outputPath, `${JSON.stringify(output, null, '\t')}\n`);

	const items = roadmaps.flatMap((r) => r.milestones.flatMap((m) => m.items));
	console.log(`Wrote roadmap.json — ${roadmaps.length} roadmaps, ${items.length} issues.`);
} catch (error) {
	// Locally, a stale copy beats a broken dev server. In CI, never publish stale data silently.
	if (!process.env.CI && existsSync(outputPath)) {
		console.warn(`Could not refresh from GitHub, keeping existing roadmap.json: ${error.message}`);
		process.exit(0);
	}
	console.error(`Could not build roadmap.json from GitHub: ${error.message}`);
	process.exit(1);
}

/**
 * Status of every issue on the org project, keyed by issue URL.
 * @param {{ org: string, number: number, statusField?: string } | undefined} project
 * @returns {Promise<Map<string, string>>}
 */
async function fetchProjectStatuses(project) {
	/** @type {Map<string, string>} */
	const statuses = new Map();
	if (!project?.org || !project?.number) return statuses;
	if (!projectToken) {
		console.warn('No ROADMAP_TOKEN set: skipping project statuses, using issue state and labels.');
		return statuses;
	}

	const query = `query($org: String!, $number: Int!, $field: String!, $cursor: String) {
		organization(login: $org) {
			projectV2(number: $number) {
				items(first: 100, after: $cursor) {
					pageInfo { hasNextPage endCursor }
					nodes {
						fieldValueByName(name: $field) { ... on ProjectV2ItemFieldSingleSelectValue { name } }
						content { ... on Issue { url } }
					}
				}
			}
		}
	}`;

	let cursor = null;
	do {
		const body = await request('/graphql', projectToken, {
			method: 'POST',
			body: JSON.stringify({
				query,
				variables: { org: project.org, number: project.number, field: project.statusField ?? 'Status', cursor }
			})
		});
		if (body.errors?.length) throw new Error(`project query failed: ${body.errors[0].message}`);

		const items = body.data?.organization?.projectV2?.items;
		if (!items) throw new Error(`project ${project.org}/${project.number} not found or not readable`);
		for (const node of items.nodes) {
			const status = toStatus(node.fieldValueByName?.name);
			if (node.content?.url && status) statuses.set(node.content.url, status);
		}
		cursor = items.pageInfo.hasNextPage ? items.pageInfo.endCursor : null;
	} while (cursor);

	console.log(`Read ${statuses.size} statuses from project ${project.org}/${project.number}.`);
	return statuses;
}

/**
 * @param {any} roadmap
 * @param {Map<string, string>} statuses
 */
async function fetchMilestones(roadmap, statuses) {
	const repo = roadmap.repo?.name;
	if (!repo) {
		console.warn(`roadmap "${roadmap.id}": no repo configured, it will have no milestones.`);
		return [];
	}

	const milestones = await requestAll(`/repos/${repo}/milestones?state=all&sort=due_on&direction=asc`);
	if (!milestones) {
		console.warn(`roadmap "${roadmap.id}": ${repo} not found (or private), it will have no milestones.`);
		return [];
	}
	const issues = (await requestAll(`/repos/${repo}/issues?milestone=*&state=all`)) ?? [];

	const usedIds = new Set();
	return milestones
		.sort((a, b) => dueTime(a) - dueTime(b) || a.number - b.number)
		.map((milestone) => {
			const items = issues
				.filter((issue) => !issue.pull_request && issue.milestone?.number === milestone.number)
				.filter((issue) => issue.state_reason !== 'not_planned')
				.map((issue) => toItem(issue, statuses))
				.sort(
					(a, b) =>
						STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) || a.number - b.number
				)
				.map(({ number, ...item }) => item);

			return {
				id: uniqueId(slugify(milestone.title) || `milestone-${milestone.number}`, usedIds),
				title: milestone.title,
				...(milestone.description ? { description: summarise(milestone.description) } : {}),
				// Open milestones derive their status from their issues at render time.
				...(milestone.state === 'closed' ? { status: 'done' } : {}),
				...(milestone.due_on ? { target: formatDue(milestone.due_on) } : {}),
				items
			};
		});
}

/**
 * @param {any} issue
 * @param {Map<string, string>} statuses
 */
function toItem(issue, statuses) {
	const labels = issue.labels.map((/** @type {any} */ l) => (typeof l === 'string' ? l : l.name));
	const linkedRoadmap = labels.find((l) => l.startsWith('roadmap:'))?.slice('roadmap:'.length);
	const labelStatus = labels.map(toStatus).find(Boolean);
	const tags = labels.filter((l) => !toStatus(l) && !l.startsWith('roadmap:'));

	// Closing the issue is the source of truth for "shipped", whatever column it was left in.
	const status =
		issue.state === 'closed'
			? 'done'
			: (statuses.get(issue.html_url) ?? labelStatus ?? 'planned');

	const description = summarise(issue.body);
	return {
		number: issue.number,
		id: `issue-${issue.number}`,
		title: issue.title,
		...(description ? { description } : {}),
		status,
		tags,
		link: linkedRoadmap
			? { label: `${linkedRoadmap} roadmap`, roadmap: linkedRoadmap }
			: { label: `#${issue.number}`, url: issue.html_url }
	};
}

/**
 * Maps a project column or label name onto a site status; undefined when it
 * isn't a status at all (so ordinary labels stay tags).
 * @param {unknown} value
 */
function toStatus(value) {
	if (typeof value !== 'string') return undefined;
	const key = value.toLowerCase().replace(/^status:\s*/, '').replace(/[^a-z]+/g, ' ').trim();
	if (['done', 'complete', 'completed', 'shipped', 'released'].includes(key)) return 'done';
	if (['in progress', 'doing', 'active', 'in review', 'review'].includes(key)) return 'in-progress';
	if (['blocked', 'on hold', 'paused'].includes(key)) return 'blocked';
	if (['todo', 'to do', 'planned', 'backlog', 'ready', 'up next'].includes(key)) return 'planned';
	return undefined;
}

/**
 * First prose paragraph of a markdown body, flattened to plain text.
 * @param {string | null | undefined} markdown
 */
function summarise(markdown) {
	if (!markdown) return '';
	const paragraph = markdown
		.replace(/<!--[\s\S]*?-->/g, '')
		.replace(/\r\n/g, '\n')
		.split(/\n\s*\n/)
		.map((block) => block.trim())
		.find((block) => block && !/^(#|```|[-*+] \[|\||>|<)/.test(block));
	if (!paragraph) return '';

	const text = paragraph
		.replace(/!\[[^\]]*\]\([^)]*\)/g, '')
		.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
		.replace(/[*_`~]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
	return text.length > 280 ? `${text.slice(0, 277).trimEnd()}…` : text;
}

/** @param {string} value */
function slugify(value) {
	return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/** @param {string} id @param {Set<string>} used */
function uniqueId(id, used) {
	let candidate = id;
	for (let n = 2; used.has(candidate); n += 1) candidate = `${id}-${n}`;
	used.add(candidate);
	return candidate;
}

/** @param {{ due_on: string | null }} milestone */
function dueTime(milestone) {
	return milestone.due_on ? Date.parse(milestone.due_on) : Number.POSITIVE_INFINITY;
}

/** @param {string} iso */
function formatDue(iso) {
	return new Date(iso).toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' });
}

/**
 * Follows REST pagination. Returns null when the resource doesn't exist.
 * @param {string} path
 */
async function requestAll(path) {
	const results = [];
	let url = `${API}${path}${path.includes('?') ? '&' : '?'}per_page=100`;
	while (url) {
		const response = await fetch(url, { headers: headers(token) });
		if (response.status === 404) return null;
		if (!response.ok) throw new Error(`${response.status} from ${url}: ${await response.text()}`);
		results.push(...(await response.json()));
		url = /<([^>]+)>;\s*rel="next"/.exec(response.headers.get('link') ?? '')?.[1] ?? '';
	}
	return results;
}

/**
 * @param {string} path
 * @param {string} auth
 * @param {RequestInit} init
 */
async function request(path, auth, init) {
	const response = await fetch(`${API}${path}`, { ...init, headers: headers(auth) });
	if (!response.ok) throw new Error(`${response.status} from ${path}: ${await response.text()}`);
	return response.json();
}

/** @param {string | undefined} auth */
function headers(auth) {
	return {
		accept: 'application/vnd.github+json',
		'x-github-api-version': '2022-11-28',
		'user-agent': 'hoardcti-roadmap',
		...(auth ? { authorization: `Bearer ${auth}` } : {})
	};
}
