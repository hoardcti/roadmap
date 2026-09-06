#!/usr/bin/env node
// Guard rail for whatever writes src/lib/data/roadmap.json: fails loudly in CI
// rather than letting a malformed feed reach the published site.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const path = fileURLToPath(new URL('../src/lib/data/roadmap.json', import.meta.url));
const STATUSES = ['done', 'in-progress', 'planned', 'blocked'];
const SLUG = /^[a-z0-9-]+$/;

/** @type {string[]} */
const errors = [];
const fail = (/** @type {string} */ message) => errors.push(message);

let data;
try {
	data = JSON.parse(readFileSync(path, 'utf8'));
} catch (error) {
	console.error(`roadmap.json is not valid JSON: ${error.message}`);
	process.exit(1);
}

if (!data.meta?.name) fail('meta.name is required');
if (!Array.isArray(data.roadmaps) || data.roadmaps.length === 0) {
	fail('roadmaps must be a non-empty array');
	report();
}

const ids = new Set();
let mainCount = 0;

for (const roadmap of data.roadmaps) {
	const where = `roadmap "${roadmap?.id ?? '?'}"`;
	if (!roadmap?.id || !SLUG.test(roadmap.id)) fail(`${where}: id must match ${SLUG}`);
	if (ids.has(roadmap.id)) fail(`${where}: duplicate roadmap id`);
	ids.add(roadmap.id);
	if (!roadmap.title) fail(`${where}: title is required`);
	if (roadmap.status && !STATUSES.includes(roadmap.status)) {
		fail(`${where}: unknown status "${roadmap.status}"`);
	}
	if (roadmap.main === true || roadmap.id === 'main') mainCount += 1;

	const milestoneIds = new Set();
	for (const milestone of roadmap.milestones ?? []) {
		const mWhere = `${where} › milestone "${milestone?.id ?? '?'}"`;
		if (!milestone?.id || !SLUG.test(milestone.id)) fail(`${mWhere}: id must match ${SLUG}`);
		if (milestoneIds.has(milestone.id)) fail(`${mWhere}: duplicate milestone id`);
		milestoneIds.add(milestone.id);
		if (!milestone.title) fail(`${mWhere}: title is required`);
		if (milestone.status && !STATUSES.includes(milestone.status)) {
			fail(`${mWhere}: unknown status "${milestone.status}"`);
		}

		const itemIds = new Set();
		for (const item of milestone.items ?? []) {
			const iWhere = `${mWhere} › item "${item?.id ?? '?'}"`;
			if (!item?.id || !SLUG.test(item.id)) fail(`${iWhere}: id must match ${SLUG}`);
			if (itemIds.has(item.id)) fail(`${iWhere}: duplicate item id`);
			itemIds.add(item.id);
			if (!item.title) fail(`${iWhere}: title is required`);
			if (item.status && !STATUSES.includes(item.status)) {
				fail(`${iWhere}: unknown status "${item.status}"`);
			}
			if (item.link && !item.link.label) fail(`${iWhere}: link.label is required`);
		}
	}
}

if (mainCount !== 1) fail(`exactly one roadmap must be the main one (found ${mainCount})`);

// Cross-references are resolved after every id is known.
for (const roadmap of data.roadmaps) {
	for (const milestone of roadmap.milestones ?? []) {
		for (const item of milestone.items ?? []) {
			const target = item.link?.roadmap;
			if (target && !ids.has(target)) {
				fail(`roadmap "${roadmap.id}" › item "${item.id}": link.roadmap "${target}" does not exist`);
			}
		}
	}
}

report();

function report() {
	if (errors.length > 0) {
		console.error(`roadmap.json has ${errors.length} problem(s):`);
		for (const error of errors) console.error(`  - ${error}`);
		process.exit(1);
	}
	const items = data.roadmaps.flatMap((r) => (r.milestones ?? []).flatMap((m) => m.items ?? []));
	console.log(
		`roadmap.json OK — ${data.roadmaps.length} roadmaps, ${items.length} work items.`
	);
	process.exit(0);
}
