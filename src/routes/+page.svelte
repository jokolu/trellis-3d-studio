<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import {
		Loader2, Sparkles, Download, AlertCircle, Box,
		Sun, Moon, Monitor, Timer, Info, Languages
	} from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import { Progress } from '$lib/components/ui/progress';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import ImageUpload from '$lib/components/ImageUpload.svelte';
	import ModelViewer from '$lib/components/ModelViewer.svelte';
	import SettingsPanel from '$lib/components/SettingsPanel.svelte';
	import { themeStore, type Theme } from '$lib/theme';
	import type { TaskStatus } from '$lib/types';

	type Lang = 'de' | 'en';

	let prompt = $state('');
	let imageData = $state('');
	let imagePreview = $state('');
	let glbBase64 = $state('');
	let status: TaskStatus = $state('idle');
	let errorMsg = $state('');
	let currentTheme: Theme = $state('system');
	let inputMode = $state('text');
	let settingsOpen = $state(false);
	let themeMenuOpen = $state(false);
	let langMenuOpen = $state(false);
	let lang: Lang = $state('de');
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

	const MAX_PROMPT_LENGTH = 512;

	const examplePrompts: { short: string; full: string }[] = [
		{ short: 'A medieval battle axe with runes', full: 'A medieval battle axe with glowing Norse runes carved into the dark iron blade, a worn leather-wrapped handle, intricate engravings on the axe head, fantasy weapon style, detailed metal texture' },
		{ short: 'Red sports car, low poly', full: 'A bright red low-poly sports car with angular geometric body panels, sleek aerodynamic shape, black tinted windows, silver alloy wheels, retro polygon art style, clean flat shading' },
		{ short: 'Wooden treasure chest with gold', full: 'An old wooden treasure chest overflowing with gold coins and jewels, reinforced with wrought iron bands and a rusty padlock, weathered oak planks, fantasy adventure style, detailed wood grain texture' },
		{ short: 'Cute robot with big eyes', full: 'A cute small round robot with oversized glowing blue eyes, articulated arms with three-fingered hands, a small antenna on top, pastel white and blue color scheme, friendly Pixar-like character design, smooth glossy plastic material' },
		{ short: 'Fantasy crystal sword', full: 'A fantasy crystal sword with a translucent glowing purple crystal blade, ornate golden hilt with wing-shaped crossguard, leather-wrapped grip, magical runes etched into the blade surface, ethereal light emanating from within' },
		{ short: 'Space station module', full: 'A detailed sci-fi space station module with cylindrical habitat sections, rotating solar panel arrays, docking ports, external piping and conduit systems, white and grey hull panels with NASA-style markings, realistic industrial design' }
	];

	const t = {
		de: {
			powered: 'Angetrieben von NVIDIA TRELLIS',
			text: 'Text',
			image: 'Bild',
			both: 'Text + Bild',
			imageWarning: 'Bilder funktionieren nur mit einem selbst-gehosteten NIM Server. Die gehostete NVIDIA API unterstützt nur vordefinierte Beispielbilder.',
			imageUpload: 'Bild-Upload',
			textPrompt: 'Text-Prompt',
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
			german: 'Deutsch',
			english: 'English',
			viewerPlaceholder: '3D-Vorschau erscheint hier',
			cameraReset: 'Kamera zurücksetzen',
			autoRotate: 'Auto-Rotation',
			screenshot: 'Screenshot',
			dropImage: 'Bild hierher ziehen oder klicken',
			imageFormats: 'PNG, JPG, WebP',
			removeImage: 'Bild entfernen'
		},
		en: {
			powered: 'Powered by NVIDIA TRELLIS',
			text: 'Text',
			image: 'Image',
			both: 'Text + Image',
			imageWarning: 'Images only work with a self-hosted NIM server. The hosted NVIDIA API only supports predefined example images.',
			imageUpload: 'Image Upload',
			textPrompt: 'Text Prompt',
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
			german: 'Deutsch',
			english: 'English',
			viewerPlaceholder: '3D preview will appear here',
			cameraReset: 'Reset camera',
			autoRotate: 'Auto-rotate',
			screenshot: 'Screenshot',
			dropImage: 'Drag image here or click',
			imageFormats: 'PNG, JPG, WebP',
			removeImage: 'Remove image'
		}
	};

	let resolvedTheme = $derived<'light' | 'dark'>(
		currentTheme === 'system'
			? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
			: currentTheme as 'light' | 'dark'
	);

	let estimatedTimeLeft = $derived(
		(status as string) === 'generating'
			? Math.max(0, Math.round(180 - elapsedTime))
			: 0
	);

	let progressPercent = $derived(
		(status as string) === 'generating'
			? Math.min(95, Math.round((elapsedTime / 180) * 100))
			: 0
	);

	onMount(() => {
		const unsubscribe = themeStore.subscribe((t) => {
			currentTheme = t;
		});

		const stored = localStorage.getItem('lang');
		if (stored === 'en' || stored === 'de') lang = stored;

		return unsubscribe;
	});

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
		if (timerInterval) {
			clearInterval(timerInterval);
			timerInterval = null;
		}
	}

	function switchMode(mode: string) {
		inputMode = mode;
		if (mode === 'text') {
			imageData = '';
			imagePreview = '';
		}
	}

	function useExample(ep: { short: string; full: string }) {
		prompt = ep.full;
		inputMode = 'text';
	}

	async function generate() {
		if (status === 'generating') return;

		const isTextMode = inputMode === 'text';
		const isImageMode = inputMode === 'image';
		const isBothMode = inputMode === 'both';

		if (isTextMode && !prompt.trim()) return;
		if (isImageMode && !imageData) return;
		if (isBothMode && !prompt.trim() && !imageData) return;

		status = 'generating';
		errorMsg = '';
		glbBase64 = '';
		startTimer();
		toast.info(t[lang].genStarted, { description: t[lang].genStartedDesc });

		try {
			const body: Record<string, unknown> = {
				seed,
				no_texture: noTexture,
				output_format: outputFormat,
				slat_cfg_scale: slatCfgScale,
				ss_cfg_scale: ssCfgScale,
				slat_sampling_steps: slatSamplingSteps,
				ss_sampling_steps: ssSamplingSteps
			};

			if ((isImageMode || isBothMode) && imageData) {
				body.image = imageData;
				body.mode = 'image';
			} else {
				body.prompt = prompt.trim();
				body.mode = 'text';
			}

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
		for (let i = 0; i < binary.length; i++) {
			bytes[i] = binary.charCodeAt(i);
		}
		const blob = new Blob([bytes], { type: 'model/gltf-binary' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `3d-visualizer-${Date.now()}.${outputFormat}`;
		a.click();
		URL.revokeObjectURL(url);
		toast.success(t[lang].downloadStarted);
	}

	function canGenerate() {
		if (status === 'generating') return false;
		if (inputMode === 'text') return prompt.trim().length > 0;
		if (inputMode === 'image') return !!imageData;
		return prompt.trim().length > 0 || !!imageData;
	}

	function handleKeydown(e: KeyboardEvent) {
		if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && canGenerate()) {
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
	<meta name="description" content="Generate 3D models from text or images using NVIDIA TRELLIS" />
</svelte:head>

<div class="flex h-screen flex-col overflow-hidden bg-background">
	<header class="flex items-center justify-between border-b px-6 py-3 bg-card shrink-0">
		<div class="flex items-center gap-3">
			<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
				<Box size={18} class="text-primary" />
			</div>
			<div>
				<h1 class="text-base font-semibold tracking-tight leading-none">3D Visualizer</h1>
				<p class="text-xs text-muted-foreground mt-0.5">{t[lang].powered}</p>
			</div>
		</div>
		<div class="flex items-center gap-1">
			<Badge variant="secondary" class="text-xs">NVIDIA NIM</Badge>

			<div class="relative">
				<Button variant="ghost" size="icon" onclick={(e) => { e.stopPropagation(); langMenuOpen = !langMenuOpen; themeMenuOpen = false; }}>
					<Languages size={18} />
				</Button>
				{#if langMenuOpen}
					<div class="absolute right-0 top-full mt-1 z-50 min-w-[140px] rounded-lg border bg-popover p-1 text-popover-foreground shadow-md">
						<button
							class="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground {lang === 'de' ? 'font-medium' : ''}"
							onclick={(e) => { e.stopPropagation(); setLang('de'); }}
						>
							🇩🇪 {t[lang].german}
						</button>
						<button
							class="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground {lang === 'en' ? 'font-medium' : ''}"
							onclick={(e) => { e.stopPropagation(); setLang('en'); }}
						>
							🇬🇧 {t[lang].english}
						</button>
					</div>
				{/if}
			</div>

			<div class="relative">
				<Button variant="ghost" size="icon" onclick={(e) => { e.stopPropagation(); themeMenuOpen = !themeMenuOpen; langMenuOpen = false; }}>
					{#if currentTheme === 'system'}
						<Monitor size={18} />
					{:else if resolvedTheme === 'dark'}
						<Moon size={18} />
					{:else}
						<Sun size={18} />
					{/if}
				</Button>
				{#if themeMenuOpen}
					<div class="absolute right-0 top-full mt-1 z-50 min-w-[160px] rounded-lg border bg-popover p-1 text-popover-foreground shadow-md">
						<button
							class="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground {currentTheme === 'light' ? 'font-medium' : ''}"
							onclick={(e) => { e.stopPropagation(); setTheme('light'); }}
						>
							<Sun size={16} /> {t[lang].light}
						</button>
						<button
							class="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground {currentTheme === 'dark' ? 'font-medium' : ''}"
							onclick={(e) => { e.stopPropagation(); setTheme('dark'); }}
						>
							<Moon size={16} /> {t[lang].dark}
						</button>
						<div class="-mx-1 my-1 h-px bg-muted"></div>
						<button
							class="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground {currentTheme === 'system' ? 'font-medium' : ''}"
							onclick={(e) => { e.stopPropagation(); setTheme('system'); }}
						>
							<Monitor size={16} /> {t[lang].system}
						</button>
					</div>
				{/if}
			</div>
		</div>
	</header>

	<main class="flex flex-1 overflow-hidden">
		<div class="flex w-full flex-col lg:flex-row">
			<div class="flex w-full flex-col gap-4 overflow-y-auto border-r p-5 lg:w-[420px] lg:min-w-[420px] lg:max-w-[420px]">
				<div class="flex gap-0 border-b">
					{#each [["text", t[lang].text], ["image", t[lang].image], ["both", t[lang].both]] as [val, label]}
						<button
							class="flex-1 pb-2.5 pt-1 text-sm font-medium text-center border-b-2 transition-colors {inputMode === val ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}"
							onclick={() => switchMode(val)}
						>
							{label}
						</button>
					{/each}
				</div>

				{#if inputMode === 'image' || inputMode === 'both'}
					{#if inputMode === 'image'}
						<div class="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
							<Info size={16} class="text-amber-500 shrink-0 mt-0.5" />
							<p class="text-xs text-muted-foreground">{t[lang].imageWarning}</p>
						</div>
					{/if}
					<Card>
						<CardHeader class="pb-3">
							<CardTitle class="text-sm">{t[lang].imageUpload}</CardTitle>
						</CardHeader>
						<CardContent>
							<ImageUpload bind:imageData bind:imagePreview {lang} />
						</CardContent>
					</Card>
				{/if}

				{#if inputMode === 'text' || inputMode === 'both'}
					<Card>
						<CardHeader class="pb-3">
							<CardTitle class="text-sm">{t[lang].textPrompt}</CardTitle>
						</CardHeader>
						<CardContent class="space-y-3">
							<Textarea
								bind:value={prompt}
								placeholder={t[lang].placeholder}
								maxlength={MAX_PROMPT_LENGTH}
								rows={inputMode === 'both' ? 3 : 4}
								class="resize-none"
							/>
							<div class="flex items-center justify-between">
								<span class="text-xs text-muted-foreground">{prompt.length}/{MAX_PROMPT_LENGTH}</span>
							</div>
						</CardContent>
					</Card>
				{/if}

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

				<Button
					onclick={generate}
					disabled={!canGenerate()}
					class="w-full shrink-0"
					size="lg"
				>
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
								<div class="flex-1 min-w-0">
									<p class="text-sm font-medium">{t[lang].genRunning}</p>
								</div>
							</div>
							<Progress value={progressPercent} class="h-1.5" />
							<div class="flex items-center justify-between text-xs text-muted-foreground">
								<span class="flex items-center gap-1">
									<Timer size={12} />
									{formatTime(elapsedTime)} {t[lang].elapsed}
								</span>
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

				<Separator />
				<p class="text-xs text-muted-foreground text-center pb-2 shrink-0">
					{t[lang].shortcut}
				</p>
			</div>

			<div class="flex-1 p-5">
				<div class="h-full">
					<ModelViewer bind:glbBase64 {lang} />
				</div>
			</div>
		</div>
	</main>
</div>
