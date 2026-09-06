# Hoard CTI — Roadmap site

A static SvelteKit + Tailwind site whose only job is publishing the roadmap. Every page is
rendered from one JSON file, so automation can update the roadmap without touching any markup.

- **Framework:** SvelteKit 2 (Svelte 5 runes) with `@sveltejs/adapter-static`
- **Styling:** Tailwind CSS v4, light and dark themes
- **Output:** fully prerendered HTML, deployable to GitHub Pages

## The data file

Everything on the site comes from [`src/lib/data/roadmap.json`](src/lib/data/roadmap.json), which
is described by [`roadmap.schema.json`](src/lib/data/roadmap.schema.json).

```jsonc
{
  "meta": { "name": "Hoard CTI", "github": "https://github.com/hoardcti", "updatedAt": "2026-09-06" },
  "roadmaps": [
    {
      "id": "main",             // the roadmap with id "main" (or "main": true) is the front page
      "title": "Roadmap",
      "summary": "…",
      "icon": "rocket",
      "intro": { "heading": "Overview", "body": "…", "callout": { "type": "info", "body": "…" } },
      "milestones": [
        {
          "id": "foundations",  // becomes the #anchor and a "On this page" entry
          "title": "Foundations",
          "status": "done",     // done | in-progress | planned | blocked
          "target": "Q1 2026",  // free text
          "items": [
            {
              "id": "schema-v1",
              "title": "Indicator schema v1",
              "description": "…",
              "status": "done",
              "tags": ["schema"],
              "note": "optional caveat",
              "link": { "label": "Scrapers roadmap", "roadmap": "scrapers" } // or "url": "https://…"
            }
          ]
        }
      ]
    },
    {
      "id": "storage",          // a splintered roadmap, served at /storage
      "title": "Storage",
      "group": "Architecture",  // sidebar section heading
      "icon": "database",
      "repo": { "name": "hoardcti/storage", "url": "https://github.com/hoardcti/storage" },
      "milestones": []
    }
  ]
}
```

Adding a roadmap to the array is all it takes: it appears in the sidebar, gets its own prerendered
page at `/<id>`, joins the card grid on the front page, and is indexed for search. Progress bars are
derived — shipped items count fully, in-progress items count half — so nothing needs to be
maintained by hand.

Available `icon` keys are the ones defined in [`Icon.svelte`](src/lib/components/Icon.svelte)
(`rocket`, `database`, `inbox`, `git-branch`, `cpu`, `zap`, `layers`, `box`, `code`, `briefcase`, …);
an unknown key falls back to a neutral icon rather than breaking the build.

### Updating it from automation

The renderer treats the file as untrusted input — unknown statuses degrade to `planned`, missing
arrays to empty — so a partial write degrades rather than crashes. Validate before publishing:

```bash
npm run validate
```

That checks slugs, duplicate ids, statuses and cross-roadmap links, and runs in CI before every
build. A job that rewrites the JSON only needs to commit it to `main`; the deploy workflow also
accepts a `repository_dispatch` of type `roadmap-updated` to rebuild on demand.

## Development

```bash
npm install
npm run dev
```

```bash
npm run build && npm run preview
```

## Deploying to GitHub Pages

`.github/workflows/deploy.yml` builds and publishes on every push to `main`. In the repository
settings, set **Pages → Build and deployment → Source** to **GitHub Actions**.

The workflow sets `BASE_PATH=/<repo-name>` because project sites are served from a subpath. For a
user/organisation site (`<user>.github.io`) or a custom domain served at the root, remove that env
var. All internal links go through SvelteKit's `base`, so nothing else needs changing.

The build emits a `404.html` fallback and `.nojekyll`, so deep links such as `/storage/` resolve
correctly on Pages.

## Layout

| Path | Purpose |
| --- | --- |
| `src/lib/data/roadmap.json` | The single source of truth |
| `src/lib/data/roadmap.js` | Normalisation, progress maths, search index, TOC helpers |
| `src/lib/components/` | Sidebar, search dialog, timeline, cards, theme toggle |
| `src/routes/+page.svelte` | Main roadmap |
| `src/routes/[slug]/+page.svelte` | Splintered roadmaps, prerendered from the JSON |
| `src/app.css` | Design tokens for both themes |
