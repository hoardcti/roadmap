# Hoard CTI — Roadmap site

A static SvelteKit + Tailwind site whose only job is publishing the roadmap. Roadmap progress
comes straight from GitHub — milestones, issues and the org project board — so nothing is maintained
by hand in this repo beyond which roadmaps exist.

- **Framework:** SvelteKit 2 (Svelte 5 runes) with `@sveltejs/adapter-static`
- **Styling:** Tailwind CSS v4, light and dark themes
- **Output:** fully prerendered HTML, deployable to GitHub Pages

## Where the data comes from

[`src/lib/data/roadmap.config.json`](src/lib/data/roadmap.config.json) (described by
[`roadmap.schema.json`](src/lib/data/roadmap.schema.json)) lists the roadmaps and the repository
behind each one. [`scripts/fetch-roadmap.mjs`](scripts/fetch-roadmap.mjs) reads GitHub and writes
`src/lib/data/roadmap.json`, which the site renders. That file is generated and git-ignored.

```jsonc
{
  "meta": {
    "name": "Hoard CTI",
    "github": "https://github.com/hoardcti",
    "project": { "org": "hoardcti", "number": 1, "statusField": "Status" } // optional
  },
  "roadmaps": [
    {
      "id": "main",             // the roadmap with id "main" (or "main": true) is the front page
      "title": "Roadmap",
      "icon": "rocket",
      "repo": { "name": "hoardcti/roadmap", "url": "https://github.com/hoardcti/roadmap" },
      "intro": { "heading": "Overview", "body": "…", "callout": { "type": "info", "body": "…" } }
    },
    {
      "id": "storage",          // a splintered roadmap, served at /storage
      "title": "Storage",
      "group": "Architecture",  // sidebar section heading
      "icon": "database",
      "repo": { "name": "hoardcti/storage", "url": "https://github.com/hoardcti/storage" }
    }
  ]
}
```

### How GitHub maps onto the roadmap

| GitHub | Roadmap |
| --- | --- |
| Milestone in the roadmap's `repo` | Milestone, ordered by due date. Title → heading and `#anchor`, description → summary, due date → target. A closed milestone is shown as shipped. |
| Issue in that milestone | Item. Title, first paragraph of the body, labels → tags, and a link to the issue. Pull requests and issues closed as *not planned* are skipped. |
| Issue closed as completed | **Shipped** |
| Project `Status` field | `Done` → shipped, `In Progress` / `In Review` → in progress, `Blocked` / `On Hold` → blocked, `Todo` / `Backlog` → planned |
| Label `status: in progress`, `blocked`, … | Same mapping, used when an open issue isn't on the project. Status labels aren't shown as tags. |
| Label `roadmap:<id>` | Links the item to that splintered roadmap instead of the issue (handy on the main roadmap). |

Open milestones and every roadmap derive their status from their issues, and progress bars are
weighted — shipped counts fully, in progress counts half.

Adding a roadmap to the config is all it takes: it appears in the sidebar, gets its own prerendered
page at `/<id>`, joins the card grid on the front page, and is indexed for search. A repo that
doesn't exist yet (or is private) just renders with no milestones.

Available `icon` keys are the ones defined in [`Icon.svelte`](src/lib/components/Icon.svelte)
(`rocket`, `database`, `inbox`, `git-branch`, `cpu`, `zap`, `layers`, `box`, `code`, `briefcase`, …);
an unknown key falls back to a neutral icon rather than breaking the build.

### Tokens

Milestones and issues on public repos need no special access. Reading the org project does: create a
fine-grained token with **Organization → Projects: read** (plus **Issues: read** for private repos)
and store it as the `ROADMAP_TOKEN` repository secret. Without it the build still works, but open
issues fall back to status labels. Locally, export `ROADMAP_TOKEN` or `GITHUB_TOKEN` to the same end.

### Refreshing

GitHub milestone, issue and project changes can't trigger a workflow in this repo, so the deploy
workflow rebuilds **hourly**, as well as on push to `main`, manual dispatch, and a
`repository_dispatch` of type `roadmap-updated` (send that from other repos for instant updates).

```bash
npm run fetch-roadmap   # refresh roadmap.json from GitHub
npm run validate        # check the generated file (runs in CI before every build)
```

`npm run dev` and `npm run build` fetch automatically only when `roadmap.json` is missing. Locally, a
failed fetch keeps the previous file; in CI it fails the build rather than publishing stale data.

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
| `src/lib/data/roadmap.config.json` | Which roadmaps exist and the repo behind each |
| `scripts/fetch-roadmap.mjs` | Builds `roadmap.json` from GitHub milestones, issues and project |
| `src/lib/data/roadmap.js` | Normalisation, progress maths, search index, TOC helpers |
| `src/lib/components/` | Sidebar, search dialog, timeline, cards, theme toggle |
| `src/routes/+page.svelte` | Main roadmap |
| `src/routes/[slug]/+page.svelte` | Splintered roadmaps, prerendered from the generated JSON |
| `src/app.css` | Design tokens for both themes |
