<script lang="ts">
	import { ChevronDown, Settings, HelpCircle } from 'lucide-svelte';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';

	type Lang = 'de' | 'en';

	let {
		seed = $bindable(0),
		noTexture = $bindable(false),
		outputFormat = $bindable<'glb' | 'stl'>('glb'),
		slatCfgScale = $bindable(3),
		ssCfgScale = $bindable(7.5),
		slatSamplingSteps = $bindable(12),
		ssSamplingSteps = $bindable(12),
		open = $bindable(false),
		lang = 'de'
	}: {
		seed: number;
		noTexture: boolean;
		outputFormat: 'glb' | 'stl';
		slatCfgScale: number;
		ssCfgScale: number;
		slatSamplingSteps: number;
		ssSamplingSteps: number;
		open: boolean;
		lang: Lang;
	} = $props();

	let infoTooltip: string | null = $state(null);
	let formatMenuOpen = $state(false);

	const t = {
		de: {
			title: 'Erweiterte Einstellungen',
			seed: 'Seed',
			seedInfo: 'Zufallsseed. 0 = zufällig, gleicher Seed = gleiches Ergebnis',
			seedPlaceholder: '0 = zufällig',
			format: 'Format',
			formatInfo: 'GLB: mit Textur/Farbe. STL: nur Geometrie, keine Farbe',
			glbOption: 'GLB (Textur)',
			stlOption: 'STL (ohne Textur)',
			slatCfg: 'SLAT CFG Scale',
			slatCfgInfo: 'Wie stark das Modell an Text/Bild hängt. Höher = näher am Input, niedriger = kreativer',
			ssCfg: 'SS CFG Scale',
			ssCfgInfo: 'Steuerung der Struktur-Erzeugung. Höher = detailgetreuer, niedriger = freiere Formen',
			slatSteps: 'SLAT Steps',
			slatStepsInfo: 'Anzahl der Diffusion-Schritte für Texturen. Mehr = feiner, aber langsamer',
			ssSteps: 'SS Steps',
			ssStepsInfo: 'Anzahl der Diffusion-Schritte für die 3D-Struktur. Mehr = detailreicher, aber langsamer',
			noTexture: 'Keine Textur',
			noTextureDesc: 'Schnellere Generierung',
			noTextureInfo: 'Überspringt das Texturen-Baking. Modell hat nur Graustufen.'
		},
		en: {
			title: 'Advanced Settings',
			seed: 'Seed',
			seedInfo: 'Random seed. 0 = random, same seed = same result',
			seedPlaceholder: '0 = random',
			format: 'Format',
			formatInfo: 'GLB: with texture/color. STL: geometry only, no color',
			glbOption: 'GLB (Texture)',
			stlOption: 'STL (no texture)',
			slatCfg: 'SLAT CFG Scale',
			slatCfgInfo: 'How strongly the model follows text/image. Higher = closer to input, lower = more creative',
			ssCfg: 'SS CFG Scale',
			ssCfgInfo: 'Controls structure generation. Higher = more faithful to detail, lower = freer shapes',
			slatSteps: 'SLAT Steps',
			slatStepsInfo: 'Number of diffusion steps for textures. More = finer, but slower',
			ssSteps: 'SS Steps',
			ssStepsInfo: 'Number of diffusion steps for 3D structure. More = more detailed, but slower',
			noTexture: 'No Texture',
			noTextureDesc: 'Faster generation',
			noTextureInfo: 'Skips texture baking. Model will only have grayscale colors.'
		}
	};

	const sliders = $derived([
		{
			key: 'slatCfg' as const,
			get value() { return slatCfgScale; },
			set: (v: number) => slatCfgScale = v,
			min: 1, max: 10, step: 0.5
		},
		{
			key: 'ssCfg' as const,
			get value() { return ssCfgScale; },
			set: (v: number) => ssCfgScale = v,
			min: 1, max: 10, step: 0.5
		},
		{
			key: 'slatSteps' as const,
			get value() { return slatSamplingSteps; },
			set: (v: number) => slatSamplingSteps = v,
			min: 10, max: 50, step: 1
		},
		{
			key: 'ssSteps' as const,
			get value() { return ssSamplingSteps; },
			set: (v: number) => ssSamplingSteps = v,
			min: 10, max: 50, step: 1
		}
	]);

	function formatLabel(): string {
		return outputFormat === 'glb' ? t[lang].glbOption : t[lang].stlOption;
	}
</script>

	<!-- svelte-ignore binding_property_non_reactive -->
<svelte:window onclick={() => { formatMenuOpen = false; }} />

<Card>
	<button
		class="flex w-full items-center justify-between p-3 text-sm font-medium hover:bg-accent/50 transition-colors rounded-lg"
		onclick={() => (open = !open)}
	>
		<span class="flex items-center gap-2">
			<Settings size={16} class="text-muted-foreground" />
			{t[lang].title}
		</span>
		<ChevronDown
			size={16}
			class="text-muted-foreground transition-transform duration-200 {open ? 'rotate-180' : ''}"
		/>
	</button>
	{#if open}
		<CardContent class="px-4 pb-4 pt-0 space-y-5">
			<div class="grid grid-cols-2 gap-3">
				<div class="space-y-1.5">
					<div class="flex items-center gap-1">
						<Label class="text-xs">{t[lang].seed}</Label>
						<button class="text-muted-foreground hover:text-foreground" onclick={() => infoTooltip = infoTooltip === 'seed' ? null : 'seed'}>
							<HelpCircle size={12} />
						</button>
					</div>
					{#if infoTooltip === 'seed'}
						<p class="text-[10px] text-muted-foreground bg-muted rounded px-2 py-1">{t[lang].seedInfo}</p>
					{/if}
					<input
						type="number"
						bind:value={seed}
						min={0}
						placeholder={t[lang].seedPlaceholder}
						class="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					/>
				</div>
				<div class="space-y-1.5">
					<div class="flex items-center gap-1">
						<Label class="text-xs">{t[lang].format}</Label>
						<button class="text-muted-foreground hover:text-foreground" onclick={() => infoTooltip = infoTooltip === 'format' ? null : 'format'}>
							<HelpCircle size={12} />
						</button>
					</div>
					{#if infoTooltip === 'format'}
						<p class="text-[10px] text-muted-foreground bg-muted rounded px-2 py-1">{t[lang].formatInfo}</p>
					{/if}
					<div class="relative">
						<button
							class="flex h-9 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							onclick={(e) => { e.stopPropagation(); formatMenuOpen = !formatMenuOpen; }}
						>
							<span>{formatLabel()}</span>
							<svg class="h-4 w-4 text-muted-foreground opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
						</button>
						{#if formatMenuOpen}
							<div class="absolute left-0 top-full mt-1 z-50 w-full rounded-lg border bg-popover p-1 text-popover-foreground shadow-md">
								<button
									class="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground {outputFormat === 'glb' ? 'font-medium' : ''}"
									onclick={(e) => { e.stopPropagation(); outputFormat = 'glb'; formatMenuOpen = false; }}
								>
									{t[lang].glbOption}
								</button>
								<button
									class="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground {outputFormat === 'stl' ? 'font-medium' : ''}"
									onclick={(e) => { e.stopPropagation(); outputFormat = 'stl'; formatMenuOpen = false; }}
								>
									{t[lang].stlOption}
								</button>
							</div>
						{/if}
					</div>
				</div>
			</div>

			<div class="space-y-4">
				{#each sliders as slider}
					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-1">
								<Label class="text-xs">{t[lang][slider.key]}</Label>
								<button
									class="text-muted-foreground hover:text-foreground"
									onclick={() => infoTooltip = infoTooltip === slider.key ? null : slider.key}
								>
									<HelpCircle size={12} />
								</button>
							</div>
							<span class="inline-flex items-center justify-center rounded-md border bg-primary/10 text-primary px-2 py-0.5 text-xs font-semibold tabular-nums min-w-[2.5rem] text-center">
								{slider.value}
							</span>
						</div>
						{#if infoTooltip === slider.key}
							<p class="text-[10px] text-muted-foreground bg-muted rounded px-2 py-1">{t[lang][`${slider.key}Info` as keyof typeof t.de]}</p>
						{/if}
						<div class="relative h-6 flex items-center">
							<div class="absolute inset-x-0 h-2 rounded-full bg-secondary"></div>
							<div
								class="absolute h-2 rounded-full bg-primary"
								style="left: 0; width: {((slider.value - slider.min) / (slider.max - slider.min)) * 100}%"
							></div>
							<input
								type="range"
								value={slider.value}
								min={slider.min}
								max={slider.max}
								step={slider.step}
								oninput={(e) => slider.set(Number((e.target as HTMLInputElement).value))}
								class="absolute inset-x-0 w-full h-2 opacity-0 cursor-pointer z-10"
							/>
							<div
								class="absolute w-5 h-5 rounded-full border-2 border-primary bg-background shadow-sm pointer-events-none"
								style="left: calc({((slider.value - slider.min) / (slider.max - slider.min)) * 100}% - 10px)"
							></div>
						</div>
						<div class="flex justify-between text-[10px] text-muted-foreground -mt-1">
							<span>{slider.min}</span>
							<span>{slider.max}</span>
						</div>
					</div>
				{/each}
			</div>

			<div class="flex items-center justify-between rounded-lg border p-3">
				<div>
					<div class="flex items-center gap-1">
						<Label class="text-xs">{t[lang].noTexture}</Label>
						<button class="text-muted-foreground hover:text-foreground" onclick={() => infoTooltip = infoTooltip === 'notex' ? null : 'notex'}>
							<HelpCircle size={12} />
						</button>
					</div>
					<p class="text-xs text-muted-foreground">{t[lang].noTextureDesc}</p>
				</div>
				{#if infoTooltip === 'notex'}
					<p class="text-[10px] text-muted-foreground bg-muted rounded px-2 py-1 max-w-[150px]">{t[lang].noTextureInfo}</p>
				{/if}
				<Switch bind:checked={noTexture} />
			</div>
		</CardContent>
	{/if}
</Card>
