import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export type Theme = 'light' | 'dark' | 'system';

function getSystemTheme(): 'light' | 'dark' {
	if (!browser) return 'dark';
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme(): Theme {
	if (!browser) return 'system';
	return (localStorage.getItem('theme') as Theme) || 'system';
}

function applyTheme(theme: Theme) {
	if (!browser) return;
	const resolved = theme === 'system' ? getSystemTheme() : theme;
	if (resolved === 'dark') {
		document.documentElement.classList.add('dark');
	} else {
		document.documentElement.classList.remove('dark');
	}
}

function createThemeStore() {
	const { subscribe, set, update } = writable<Theme>(getStoredTheme());

	return {
		subscribe,
		set: (theme: Theme) => {
			if (browser) localStorage.setItem('theme', theme);
			applyTheme(theme);
			set(theme);
		},
		initialize: () => {
			const theme = getStoredTheme();
			applyTheme(theme);
			set(theme);
		}
	};
}

export const themeStore = createThemeStore();
