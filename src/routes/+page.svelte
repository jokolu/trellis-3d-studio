<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import {
		Loader2, Sparkles, Download, AlertCircle, Box,
		Sun, Moon, Monitor, Timer, Languages, PanelLeft, X, Menu,
		History, Trash2, MessageSquare
	} from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import { Progress } from '$lib/components/ui/progress';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import ModelViewer from '$lib/components/ModelViewer.svelte';
	import SettingsPanel from '$lib/components/SettingsPanel.svelte';
	import { themeStore, type Theme } from '$lib/theme';
	import { LANGUAGES, isWindows, type Lang } from '$lib/i18n';
	import type { TaskStatus } from '$lib/types';

	let prompt = $state('');
	let glbBase64 = $state('');
	let status: TaskStatus = $state('idle');
	let errorMsg = $state('');
	let currentTheme: Theme = $state('system');
	let settingsOpen = $state(false);
	let themeMenuOpen = $state(false);
	let langMenuOpen = $state(false);
	let lang: Lang = $state('de');
	let sidebarOpen = $state(true);
	let activeTab: 'text' | 'history' = $state('text');
	let generationStartTime = $state(0);
	let elapsedTime = $state(0);
	let timerInterval: ReturnType<typeof setInterval> | null = null;

	let seed = $state(0);
	let noTexture = $state(false);
	let outputFormat = $state<'glb' | 'stl'>('glb');
	let slatCfgScale = $state(3);
	let ssCfgScale = $state(7.5);
	let slatSamplingSteps = $state(12);
	let ssSamplingSteps = $state(12);

	const MAX_PROMPT_LENGTH = 77;
	const VALID_LANGS = new Set<string>(LANGUAGES.map(l => l.code));

	interface HistoryEntry {
		id: string;
		prompt: string;
		timestamp: number;
		format: string;
		base64: string;
	}
	let history: HistoryEntry[] = $state([]);

	const examplePrompts: { short: string; full: string }[] = [
		{ short: 'Battle axe with runes', full: 'Medieval battle axe with glowing Norse runes, dark iron, leather handle' },
		{ short: 'Red low-poly car', full: 'Red low-poly sports car, angular body, black windows, silver alloy wheels' },
		{ short: 'Treasure chest', full: 'Wooden treasure chest, gold coins, iron bands, rusty padlock, fantasy' },
		{ short: 'Cute robot', full: 'Cute round robot, glowing blue eyes, small antenna, white and blue' },
		{ short: 'Crystal sword', full: 'Crystal sword, translucent purple blade, golden wing hilt, glowing runes' },
		{ short: 'Space station', full: 'Sci-fi space station module, solar panels, docking ports, white hull' }
	];

	const t: Record<Lang, Record<string, string>> = {
		de: {
			powered: 'Angetrieben von NVIDIA TRELLIS',
			placeholder: 'Beschreibe dein 3D-Modell...',
			examples: 'Beispiel-Prompts',
			generate: '3D-Modell generieren',
			generating: 'Generiere...',
			genStarted: 'Generierung gestartet...',
			genStartedDesc: 'Ca. 2-3 Minuten',
			genRunning: 'Modell wird generiert',
			elapsed: 'vergangen',
			remaining: 'verbleibend',
			genSuccess: '3D-Modell erfolgreich generiert!',
			duration: 'Dauer',
			genError: 'Fehler bei der Generierung',
			unexpected: 'Unerwartete Antwort von der API',
			unknownError: 'Unbekannter Fehler',
			error: 'Fehler',
			download: 'herunterladen',
			downloadStarted: 'Download gestartet',
			shortcut: 'Strg+Enter zum Generieren',
			light: 'Hell',
			dark: 'Dunkel',
			system: 'System',
			history: 'Verlauf',
			historyEmpty: 'Noch keine Modelle generiert.',
			loadModel: 'Laden',
			clearHistory: 'Verlauf löschen',
			historyFull: 'Max. 20 Einträge. Älteste werden entfernt.',
			tabText: 'Text',
			tabHistory: 'Verlauf'
		},
		en: {
			powered: 'Powered by NVIDIA TRELLIS',
			placeholder: 'Describe your 3D model...',
			examples: 'Example Prompts',
			generate: 'Generate 3D Model',
			generating: 'Generating...',
			genStarted: 'Generation started...',
			genStartedDesc: 'Approx. 2-3 minutes',
			genRunning: 'Model is being generated',
			elapsed: 'elapsed',
			remaining: 'remaining',
			genSuccess: '3D model generated successfully!',
			duration: 'Duration',
			genError: 'Generation failed',
			unexpected: 'Unexpected API response',
			unknownError: 'Unknown error',
			error: 'Error',
			download: 'download',
			downloadStarted: 'Download started',
			shortcut: 'Ctrl+Enter to generate',
			light: 'Light',
			dark: 'Dark',
			system: 'System',
			history: 'History',
			historyEmpty: 'No models generated yet.',
			loadModel: 'Load',
			clearHistory: 'Clear history',
			historyFull: 'Max 20 entries. Oldest removed first.',
			tabText: 'Text',
			tabHistory: 'History'
		},
		fr: { powered: 'Propulsé par NVIDIA TRELLIS', placeholder: 'Décrivez votre modèle 3D...', examples: 'Exemples de prompts', generate: 'Générer le modèle 3D', generating: 'Génération...', genStarted: 'Génération démarrée...', genStartedDesc: 'Environ 2-3 minutes', genRunning: 'Le modèle est en cours de génération', elapsed: 'écoulé', remaining: 'restant', genSuccess: 'Modèle 3D généré avec succès !', duration: 'Durée', genError: 'Échec de la génération', unexpected: 'Réponse API inattendue', unknownError: 'Erreur inconnue', error: 'Erreur', download: 'télécharger', downloadStarted: 'Téléchargement démarré', shortcut: 'Ctrl+Entrée pour générer', light: 'Clair', dark: 'Sombre', system: 'Système', history: 'Historique', historyEmpty: 'Aucun modèle généré.', loadModel: 'Charger', 			clearHistory: 'Effacer', historyFull: 'Max 20 entrées.', tabText: 'Texte', tabHistory: 'Historique' },
		es: { powered: 'Impulsado por NVIDIA TRELLIS', placeholder: 'Describe tu modelo 3D...', examples: 'Prompts de ejemplo', generate: 'Generar modelo 3D', generating: 'Generando...', genStarted: 'Generación iniciada...', genStartedDesc: 'Aprox. 2-3 minutos', genRunning: 'El modelo se está generando', elapsed: 'transcurrido', remaining: 'restante', genSuccess: '¡Modelo 3D generado con éxito!', duration: 'Duración', genError: 'Error en la generación', unexpected: 'Respuesta API inesperada', unknownError: 'Error desconocido', error: 'Error', download: 'descargar', downloadStarted: 'Descarga iniciada', shortcut: 'Ctrl+Enter para generar', light: 'Claro', dark: 'Oscuro', system: 'Sistema', history: 'Historial', historyEmpty: 'Sin modelos.', loadModel: 'Cargar', 			clearHistory: 'Limpiar', historyFull: 'Máx 20 entradas.', tabText: 'Texto', tabHistory: 'Historial' },
		it: { powered: 'Alimentato da NVIDIA TRELLIS', placeholder: 'Descrivi il tuo modello 3D...', examples: 'Prompt di esempio', generate: 'Genera modello 3D', generating: 'Generazione...', genStarted: 'Generazione avviata...', genStartedDesc: 'Circa 2-3 minuti', genRunning: 'Il modello è in fase di generazione', elapsed: 'trascorso', remaining: 'rimanente', genSuccess: 'Modello 3D generato con successo!', duration: 'Durata', genError: 'Generazione fallita', unexpected: 'Risposta API imprevista', unknownError: 'Errore sconosciuto', error: 'Errore', download: 'scarica', downloadStarted: 'Download avviato', shortcut: 'Ctrl+Invio per generare', light: 'Chiaro', dark: 'Scuro', system: 'Sistema', history: 'Cronologia', historyEmpty: 'Nessun modello.', loadModel: 'Carica', 			clearHistory: 'Cancella', historyFull: 'Max 20 elementi.', tabText: 'Testo', tabHistory: 'Cronologia' },
		pt: { powered: 'Desenvolvido por NVIDIA TRELLIS', placeholder: 'Descreva seu modelo 3D...', examples: 'Prompts de exemplo', generate: 'Gerar modelo 3D', generating: 'Gerando...', genStarted: 'Geração iniciada...', genStartedDesc: 'Aprox. 2-3 minutos', genRunning: 'O modelo está sendo gerado', elapsed: 'decorrido', remaining: 'restante', genSuccess: 'Modelo 3D gerado com sucesso!', duration: 'Duração', genError: 'Falha na geração', unexpected: 'Resposta inesperada da API', unknownError: 'Erro desconhecido', error: 'Erro', download: 'baixar', downloadStarted: 'Download iniciado', shortcut: 'Ctrl+Enter para gerar', light: 'Claro', dark: 'Escuro', system: 'Sistema', history: 'Histórico', historyEmpty: 'Nenhum modelo.', loadModel: 'Carregar', 			clearHistory: 'Limpar', historyFull: 'Máx 20 entradas.', tabText: 'Texto', tabHistory: 'Histórico' },
		ja: { powered: 'NVIDIA TRELLIS 搭載', placeholder: '3Dモデルを説明してください...', examples: 'プロンプト例', generate: '3Dモデルを生成', generating: '生成中...', genStarted: '生成を開始しました...', genStartedDesc: '約2-3分', genRunning: 'モデルを生成中', elapsed: '経過', remaining: '残り', genSuccess: '3Dモデルの生成に成功しました！', duration: '所要時間', genError: '生成に失敗しました', unexpected: '予期しないAPIレスポンス', unknownError: '不明なエラー', error: 'エラー', download: 'ダウンロード', downloadStarted: 'ダウンロード開始', shortcut: 'Ctrl+Enterで生成', light: 'ライト', dark: 'ダーク', system: 'システム', history: '履歴', historyEmpty: 'モデルなし。', loadModel: '読込', 			clearHistory: 'クリア', historyFull: '最大20件。', tabText: 'テキスト', tabHistory: '履歴' },
		zh: { powered: '由 NVIDIA TRELLIS 提供支持', placeholder: '描述您的3D模型...', examples: '示例提示', generate: '生成3D模型', generating: '生成中...', genStarted: '生成已开始...', genStartedDesc: '大约2-3分钟', genRunning: '模型正在生成中', elapsed: '已用', remaining: '剩余', genSuccess: '3D模型生成成功！', duration: '用时', genError: '生成失败', unexpected: '意外的API响应', unknownError: '未知错误', error: '错误', download: '下载', downloadStarted: '下载已开始', shortcut: 'Ctrl+Enter 生成', light: '浅色', dark: '深色', system: '跟随系统', history: '历史', historyEmpty: '暂无模型。', loadModel: '加载', 			clearHistory: '清除', historyFull: '最多20条。', tabText: '文本', tabHistory: '历史' }
	};

	let resolvedTheme = $derived<'light' | 'dark'>(
		currentTheme === 'system'
			? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
			: currentTheme as 'light' | 'dark'
	);

	let estimatedTimeLeft = $derived(
		(status as string) === 'generating' ? Math.max(0, Math.round(180 - elapsedTime)) : 0
	);

	let progressPercent = $derived(
		(status as string) === 'generating' ? Math.min(95, Math.round((elapsedTime / 180) * 100)) : 0
	);

	onMount(() => {
		const unsubscribe = themeStore.subscribe((t) => { currentTheme = t; });
		const stored = localStorage.getItem('lang');
		if (stored && VALID_LANGS.has(stored)) lang = stored as Lang;
		loadHistory();
		return unsubscribe;
	});

	function loadHistory() {
		try {
			const raw = localStorage.getItem('model-history');
			if (raw) history = JSON.parse(raw);
		} catch { history = []; }
	}

	function saveToHistory(promptText: string, base64: string) {
		const entry: HistoryEntry = {
			id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
			prompt: promptText,
			timestamp: Date.now(),
			format: outputFormat,
			base64
		};
		history = [entry, ...history].slice(0, 20);
		try {
			localStorage.setItem('model-history', JSON.stringify(history));
		} catch {
			while (history.length > 5) history.pop();
			try { localStorage.setItem('model-history', JSON.stringify(history)); } catch {}
		}
	}

	function loadFromHistory(entry: HistoryEntry) {
		glbBase64 = entry.base64;
		outputFormat = (entry.format as 'glb' | 'stl') || 'glb';
		status = 'done';
		activeTab = 'text';
	}

	function clearHistory() {
		history = [];
		localStorage.removeItem('model-history');
	}

	function setTheme(theme: Theme) {
		themeStore.set(theme);
		themeMenuOpen = false;
	}

	function setLang(l: Lang) {
		lang = l;
		langMenuOpen = false;
		if (typeof localStorage !== 'undefined') localStorage.setItem('lang', l);
	}

	function formatTime(seconds: number): string {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${m}:${s.toString().padStart(2, '0')}`;
	}

	function startTimer() {
		generationStartTime = Date.now();
		elapsedTime = 0;
		timerInterval = setInterval(() => {
			elapsedTime = Math.floor((Date.now() - generationStartTime) / 1000);
		}, 1000);
	}

	function stopTimer() {
		if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
	}

	function useExample(ep: { short: string; full: string }) {
		prompt = ep.full;
	}

	async function generate() {
		if (status === 'generating' || !prompt.trim()) return;

		status = 'generating';
		errorMsg = '';
		glbBase64 = '';
		startTimer();
		toast.info(t[lang].genStarted, { description: t[lang].genStartedDesc });

		try {
			const body: Record<string, unknown> = {
				prompt: prompt.trim(),
				mode: 'text',
				seed,
				no_texture: noTexture,
				output_format: outputFormat,
				slat_cfg_scale: slatCfgScale,
				ss_cfg_scale: ssCfgScale,
				slat_sampling_steps: slatSamplingSteps,
				ss_sampling_steps: ssSamplingSteps
			};

			const res = await fetch('/api/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || `${t[lang].error}: ${res.status}`);
			}

			if (data.artifacts?.[0]?.base64) {
				glbBase64 = data.artifacts[0].base64;
				status = 'done';
				stopTimer();
				saveToHistory(prompt.trim(), glbBase64);
				toast.success(t[lang].genSuccess, { description: `${t[lang].duration}: ${formatTime(elapsedTime)}` });
			} else {
				throw new Error(t[lang].unexpected);
			}
		} catch (err) {
			status = 'error';
			stopTimer();
			errorMsg = err instanceof Error ? err.message : t[lang].unknownError;
			toast.error(t[lang].genError, { description: errorMsg });
		}
	}

	function downloadModel() {
		if (!glbBase64) return;
		const binary = atob(glbBase64);
		const bytes = new Uint8Array(binary.length);
		for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
		const blob = new Blob([bytes], { type: 'model/gltf-binary' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `3d-visualizer-${Date.now()}.${outputFormat}`;
		a.click();
		URL.revokeObjectURL(url);
		toast.success(t[lang].downloadStarted);
	}

	function handleKeydown(e: KeyboardEvent) {
		if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && status !== 'generating' && prompt.trim()) {
			e.preventDefault();
			generate();
		}
	}

	function closeMenus() {
		themeMenuOpen = false;
		langMenuOpen = false;
	}
</script>

<svelte:window onkeydown={handleKeydown} onclick={closeMenus} />

<svelte:head>
	<title>3D Visualizer</title>
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
	<meta name="description" content="Generate 3D models from text using NVIDIA TRELLIS" />
</svelte:head>

<div class="flex h-dvh flex-col overflow-hidden bg-background">
	<header class="flex items-center justify-between border-b px-2 py-2 sm:px-4 sm:py-2.5 bg-card shrink-0">
		<div class="flex items-center gap-2">
			<Button variant="ghost" size="icon" class="h-8 w-8 shrink-0 lg:hidden" onclick={() => sidebarOpen = !sidebarOpen}>
				<Menu size={18} />
			</Button>
			<div class="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 shrink-0">
				<Box size={15} class="text-primary" />
			</div>
			<h1 class="text-sm font-semibold tracking-tight leading-none hidden sm:block">3D Visualizer</h1>
			<Button variant="ghost" size="icon" class="h-8 w-8 shrink-0 hidden lg:inline-flex" onclick={() => sidebarOpen = !sidebarOpen}>
				<PanelLeft size={18} />
			</Button>
		</div>
		<div class="flex items-center gap-1">

			<div class="relative">
				<Button variant="ghost" size="icon" class="h-8 w-8" onclick={(e) => { e.stopPropagation(); langMenuOpen = !langMenuOpen; themeMenuOpen = false; }}>
					<Languages size={16} />
				</Button>
				{#if langMenuOpen}
					<div class="absolute right-0 top-full mt-1 z-50 min-w-[140px] max-h-[280px] overflow-y-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-md">
						{#each LANGUAGES as l}
							<button
								class="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground {lang === l.code ? 'font-medium' : ''}"
								onclick={(e) => { e.stopPropagation(); setLang(l.code); }}
							>
								<span style={isWindows() ? 'font-family: Segoe UI Emoji, sans-serif' : ''}>{l.flag}</span> {l.name}
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<div class="relative">
				<Button variant="ghost" size="icon" class="h-8 w-8" onclick={(e) => { e.stopPropagation(); themeMenuOpen = !themeMenuOpen; langMenuOpen = false; }}>
					{#if currentTheme === 'system'}<Monitor size={16} />
					{:else if resolvedTheme === 'dark'}<Moon size={16} />
					{:else}<Sun size={16} />{/if}
				</Button>
				{#if themeMenuOpen}
					<div class="absolute right-0 top-full mt-1 z-50 min-w-[140px] rounded-lg border bg-popover p-1 text-popover-foreground shadow-md">
						<button class="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground {currentTheme === 'light' ? 'font-medium' : ''}" onclick={(e) => { e.stopPropagation(); setTheme('light'); }}>
							<Sun size={14} /> {t[lang].light}
						</button>
						<button class="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground {currentTheme === 'dark' ? 'font-medium' : ''}" onclick={(e) => { e.stopPropagation(); setTheme('dark'); }}>
							<Moon size={14} /> {t[lang].dark}
						</button>
						<div class="-mx-1 my-1 h-px bg-muted"></div>
						<button class="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground {currentTheme === 'system' ? 'font-medium' : ''}" onclick={(e) => { e.stopPropagation(); setTheme('system'); }}>
							<Monitor size={14} /> {t[lang].system}
						</button>
					</div>
				{/if}
			</div>
		</div>
	</header>

	<main class="flex flex-1 overflow-hidden">
		{#if sidebarOpen}
			<div class="fixed inset-0 bg-black/50 z-30 lg:hidden" onclick={() => sidebarOpen = false} role="presentation"></div>
		{/if}
		<aside
			class="fixed inset-y-0 left-2 z-40 flex flex-col w-[85vw] max-w-[400px] bg-background transform transition-all duration-300 ease-in-out rounded-r-2xl shadow-2xl lg:left-0 lg:rounded-none lg:shadow-none lg:border-r lg:relative lg:z-auto {sidebarOpen ? 'translate-x-0 lg:w-[400px] lg:min-w-[400px] lg:max-w-[400px]' : '-translate-x-[calc(100%+8px)] lg:-translate-x-full lg:w-0 lg:min-w-0 lg:max-w-0 lg:overflow-hidden lg:border-r-0'}"
		>
			<div class="flex items-center justify-between px-4 py-3 border-b shrink-0">
				<span class="text-sm font-medium">3D Visualizer</span>
				<Button variant="ghost" size="icon" class="h-7 w-7 lg:hidden" onclick={() => sidebarOpen = false}>
					<X size={16} />
				</Button>
			</div>
			<div class="flex border-b shrink-0">
				<button
					class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors relative {activeTab === 'text' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}"
					onclick={() => activeTab = 'text'}
				>
					<MessageSquare size={14} />
					{t[lang].tabText}
					{#if activeTab === 'text'}<div class="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full"></div>{/if}
				</button>
				<button
					class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors relative {activeTab === 'history' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}"
					onclick={() => activeTab = 'history'}
				>
					<History size={14} />
					{t[lang].tabHistory}
					<Badge variant="secondary" class="text-[10px] ml-0.5 h-4 min-w-[1.2rem]">{history.length}</Badge>
					{#if activeTab === 'history'}<div class="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full"></div>{/if}
				</button>
			</div>
			<div class="flex-1 overflow-y-auto p-4 space-y-4">
				{#if activeTab === 'text'}
					<Card>
						<CardHeader class="pb-3">
							<CardTitle class="text-sm">{t[lang].placeholder}</CardTitle>
						</CardHeader>
						<CardContent class="space-y-3">
							<Textarea
								bind:value={prompt}
								placeholder={t[lang].placeholder}
								maxlength={MAX_PROMPT_LENGTH}
								rows={4}
								class="resize-none"
							/>
							<span class="text-xs text-muted-foreground">{prompt.length}/{MAX_PROMPT_LENGTH}</span>
						</CardContent>
					</Card>

					<div>
						<Label class="text-xs text-muted-foreground mb-2 block">{t[lang].examples}</Label>
						<div class="flex flex-wrap gap-1.5">
							{#each examplePrompts as ep}
								<button
									class="rounded-full border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
									onclick={() => useExample(ep)}
								>
									{ep.short}
								</button>
							{/each}
						</div>
					</div>

					<SettingsPanel
						bind:seed
						bind:noTexture
						bind:outputFormat
						bind:slatCfgScale
						bind:ssCfgScale
						bind:slatSamplingSteps
						bind:ssSamplingSteps
						bind:open={settingsOpen}
						{lang}
					/>

					<Button onclick={generate} disabled={status === 'generating' || !prompt.trim()} class="w-full shrink-0" size="lg">
						{#if status === 'generating'}
							<Loader2 size={18} class="mr-2 animate-spin" />
							{t[lang].generating}
						{:else}
							<Sparkles size={18} class="mr-2" />
							{t[lang].generate}
						{/if}
					</Button>

					{#if status === 'generating'}
						<Card class="border-primary/20 bg-primary/5 shrink-0">
							<CardContent class="p-4 space-y-3">
								<div class="flex items-center gap-3">
									<Loader2 size={20} class="animate-spin text-primary shrink-0" />
									<p class="text-sm font-medium">{t[lang].genRunning}</p>
								</div>
								<Progress value={progressPercent} class="h-1.5" />
								<div class="flex items-center justify-between text-xs text-muted-foreground">
									<span class="flex items-center gap-1"><Timer size={12} /> {formatTime(elapsedTime)} {t[lang].elapsed}</span>
									<span>~{formatTime(estimatedTimeLeft)} {t[lang].remaining}</span>
								</div>
							</CardContent>
						</Card>
					{/if}

					{#if status === 'error'}
						<Alert variant="destructive" class="shrink-0">
							<AlertCircle size={18} class="shrink-0" />
							<AlertDescription>
								<p class="font-medium">{t[lang].genError}</p>
								<p class="text-xs mt-1 opacity-80">{errorMsg}</p>
							</AlertDescription>
						</Alert>
					{/if}

					{#if status === 'done' && glbBase64}
						<Button onclick={downloadModel} variant="outline" class="w-full shrink-0">
							<Download size={16} class="mr-2" />
							{outputFormat.toUpperCase()} {t[lang].download}
						</Button>
					{/if}

					<p class="text-xs text-muted-foreground text-center pb-1 shrink-0">{t[lang].shortcut}</p>
				{:else}
					<div class="space-y-2">
						{#if history.length === 0}
							<p class="text-xs text-muted-foreground py-8 text-center">{t[lang].historyEmpty}</p>
						{:else}
							<div class="flex justify-between items-center">
								<span class="text-xs text-muted-foreground">{t[lang].historyFull}</span>
								<Button variant="ghost" size="sm" class="h-6 text-xs gap-1 text-destructive" onclick={clearHistory}>
									<Trash2 size={12} /> {t[lang].clearHistory}
								</Button>
							</div>
							{#each history as entry (entry.id)}
								<div class="flex items-center gap-2 rounded-lg border p-2">
									<div class="flex-1 min-w-0">
										<p class="text-xs truncate">{entry.prompt}</p>
										<p class="text-[10px] text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</p>
									</div>
									<Button variant="secondary" size="sm" class="h-6 text-[10px] shrink-0" onclick={() => loadFromHistory(entry)}>
										{t[lang].loadModel}
									</Button>
								</div>
							{/each}
						{/if}
					</div>
				{/if}
			</div>
		</aside>

		<section class="flex-1 p-2 sm:p-4 min-w-0">
			<div class="h-full">
				<ModelViewer bind:glbBase64 {lang} />
			</div>
		</section>
	</main>
</div>
