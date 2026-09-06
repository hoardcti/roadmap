import { browser } from '$app/environment';

/** @type {{ value: 'light' | 'dark' }} */
const state = $state({ value: 'light' });

export const theme = {
	get value() {
		return state.value;
	},
	/** @param {'light' | 'dark'} next */
	set(next) {
		state.value = next;
		if (!browser) return;
		document.documentElement.classList.toggle('dark', next === 'dark');
		document.documentElement.style.colorScheme = next;
		try {
			localStorage.setItem('theme', next);
		} catch {
			// Storage can be unavailable (private mode); the theme still applies.
		}
	},
	toggle() {
		this.set(state.value === 'dark' ? 'light' : 'dark');
	},
	/** Reads whatever the inline <head> script already decided. */
	sync() {
		if (!browser) return;
		state.value = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
	}
};
