export type Lang = 'de' | 'en' | 'fr' | 'es' | 'it' | 'pt' | 'ja' | 'zh';

export const LANGUAGES: { code: Lang; flag: string; name: string }[] = [
	{ code: 'de', flag: '🇩🇪', name: 'Deutsch' },
	{ code: 'en', flag: '🇬🇧', name: 'English' },
	{ code: 'fr', flag: '🇫🇷', name: 'Français' },
	{ code: 'es', flag: '🇪🇸', name: 'Español' },
	{ code: 'it', flag: '🇮🇹', name: 'Italiano' },
	{ code: 'pt', flag: '🇧🇷', name: 'Português' },
	{ code: 'ja', flag: '🇯🇵', name: '日本語' },
	{ code: 'zh', flag: '🇨🇳', name: '中文' }
];

export function isWindows(): boolean {
	if (typeof navigator === 'undefined') return false;
	return navigator.userAgent.includes('Windows');
}
