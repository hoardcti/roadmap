import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// GitHub Pages project sites are served from https://<user>.github.io/<repo>,
// so the build needs a base path. Set BASE_PATH=/roadmap (or whatever the repo
// is called) in CI. User/organisation pages and custom domains leave it empty.
const base = process.env.BASE_PATH ?? '';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: '404.html',
			precompress: false,
			strict: true
		}),
		paths: {
			base,
			relative: false
		},
		prerender: {
			handleHttpError: 'fail',
			handleMissingId: 'warn'
		}
	}
};

export default config;
