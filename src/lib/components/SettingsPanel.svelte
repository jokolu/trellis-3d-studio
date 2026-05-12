<script lang="ts">
	import { ChevronDown, Settings, HelpCircle } from 'lucide-svelte';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import type { Lang } from '$lib/i18n';

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

	const t: Record<Lang, Record<string, string>> = {
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
		},
		fr: {
			title: 'Paramètres avancés',
			seed: 'Seed',
			seedInfo: 'Graine aléatoire. 0 = aléatoire, même graine = même résultat',
			seedPlaceholder: '0 = aléatoire',
			format: 'Format',
			formatInfo: 'GLB : avec texture/couleur. STL : géométrie uniquement, sans couleur',
			glbOption: 'GLB (Texture)',
			stlOption: 'STL (sans texture)',
			slatCfg: 'SLAT CFG Scale',
			slatCfgInfo: 'Force avec laquelle le modèle suit le texte/image. Plus élevé = plus proche de l\'entrée, plus bas = plus créatif',
			ssCfg: 'SS CFG Scale',
			ssCfgInfo: 'Contrôle la génération de structure. Plus élevé = plus fidèle, plus bas = formes plus libres',
			slatSteps: 'SLAT Steps',
			slatStepsInfo: 'Nombre d\'étapes de diffusion pour les textures. Plus = plus fin, mais plus lent',
			ssSteps: 'SS Steps',
			ssStepsInfo: 'Nombre d\'étapes de diffusion pour la structure 3D. Plus = plus détaillé, mais plus lent',
			noTexture: 'Sans texture',
			noTextureDesc: 'Génération plus rapide',
			noTextureInfo: 'Ignore le baking de texture. Le modèle n\'aura que des niveaux de gris.'
		},
		es: {
			title: 'Configuración avanzada',
			seed: 'Seed',
			seedInfo: 'Semilla aleatoria. 0 = aleatoria, misma semilla = mismo resultado',
			seedPlaceholder: '0 = aleatorio',
			format: 'Formato',
			formatInfo: 'GLB: con textura/color. STL: solo geometría, sin color',
			glbOption: 'GLB (Textura)',
			stlOption: 'STL (sin textura)',
			slatCfg: 'SLAT CFG Scale',
			slatCfgInfo: 'Qué tan fuerte sigue el modelo al texto/imagen. Más alto = más cerca del input, más bajo = más creativo',
			ssCfg: 'SS CFG Scale',
			ssCfgInfo: 'Controla la generación de estructura. Más alto = más fiel, más bajo = formas más libres',
			slatSteps: 'SLAT Steps',
			slatStepsInfo: 'Número de pasos de difusión para texturas. Más = más fino, pero más lento',
			ssSteps: 'SS Steps',
			ssStepsInfo: 'Número de pasos de difusión para la estructura 3D. Más = más detallado, pero más lento',
			noTexture: 'Sin textura',
			noTextureDesc: 'Generación más rápida',
			noTextureInfo: 'Omite el baking de texturas. El modelo solo tendrá escala de grises.'
		},
		it: {
			title: 'Impostazioni avanzate',
			seed: 'Seed',
			seedInfo: 'Seed casuale. 0 = casuale, stesso seed = stesso risultato',
			seedPlaceholder: '0 = casuale',
			format: 'Formato',
			formatInfo: 'GLB: con texture/colore. STL: solo geometria, senza colore',
			glbOption: 'GLB (Texture)',
			stlOption: 'STL (senza texture)',
			slatCfg: 'SLAT CFG Scale',
			slatCfgInfo: 'Quanto fortemente il modello segue testo/immagine. Più alto = più vicino all\'input, più basso = più creativo',
			ssCfg: 'SS CFG Scale',
			ssCfgInfo: 'Controlla la generazione della struttura. Più alto = più fedele, più basso = forme più libere',
			slatSteps: 'SLAT Steps',
			slatStepsInfo: 'Numero di passaggi di diffusione per le texture. Più = più fine, ma più lento',
			ssSteps: 'SS Steps',
			ssStepsInfo: 'Numero di passaggi di diffusione per la struttura 3D. Più = più dettagliato, ma più lento',
			noTexture: 'Senza texture',
			noTextureDesc: 'Generazione più veloce',
			noTextureInfo: 'Salta il baking delle texture. Il modello avrà solo tonalità di grigio.'
		},
		pt: {
			title: 'Configurações avançadas',
			seed: 'Seed',
			seedInfo: 'Seed aleatório. 0 = aleatório, mesmo seed = mesmo resultado',
			seedPlaceholder: '0 = aleatório',
			format: 'Formato',
			formatInfo: 'GLB: com textura/cor. STL: apenas geometria, sem cor',
			glbOption: 'GLB (Textura)',
			stlOption: 'STL (sem textura)',
			slatCfg: 'SLAT CFG Scale',
			slatCfgInfo: 'Quão fortemente o modelo segue texto/imagem. Maior = mais próximo do input, menor = mais criativo',
			ssCfg: 'SS CFG Scale',
			ssCfgInfo: 'Controla a geração de estrutura. Maior = mais fiel, menor = formas mais livres',
			slatSteps: 'SLAT Steps',
			slatStepsInfo: 'Número de passos de difusão para texturas. Mais = mais fino, mas mais lento',
			ssSteps: 'SS Steps',
			ssStepsInfo: 'Número de passos de difusão para a estrutura 3D. Mais = mais detalhado, mas mais lento',
			noTexture: 'Sem textura',
			noTextureDesc: 'Geração mais rápida',
			noTextureInfo: 'Pula o baking de textura. O modelo terá apenas tons de cinza.'
		},
		ja: {
			title: '詳細設定',
			seed: 'シード',
			seedInfo: 'ランダムシード。0 = ランダム、同じシード = 同じ結果',
			seedPlaceholder: '0 = ランダム',
			format: 'フォーマット',
			formatInfo: 'GLB：テクスチャ/カラー付き。STL：ジオメトリのみ、色なし',
			glbOption: 'GLB（テクスチャ）',
			stlOption: 'STL（テクスチャなし）',
			slatCfg: 'SLAT CFG Scale',
			slatCfgInfo: 'モデルがテキスト/画像にどの程度従うか。高い = 入力に近い、低い = より創造的',
			ssCfg: 'SS CFG Scale',
			ssCfgInfo: '構造生成の制御。高い = より忠実、低い = より自由な形状',
			slatSteps: 'SLAT Steps',
			slatStepsInfo: 'テクスチャの拡散ステップ数。多い = より精細、ただし遅い',
			ssSteps: 'SS Steps',
			ssStepsInfo: '3D構造の拡散ステップ数。多い = より詳細、ただし遅い',
			noTexture: 'テクスチャなし',
			noTextureDesc: 'より高速な生成',
			noTextureInfo: 'テクスチャベイク処理をスキップ。モデルはグレースケールのみ。'
		},
		zh: {
			title: '高级设置',
			seed: '种子',
			seedInfo: '随机种子。0 = 随机，相同种子 = 相同结果',
			seedPlaceholder: '0 = 随机',
			format: '格式',
			formatInfo: 'GLB：带纹理/颜色。STL：仅几何体，无颜色',
			glbOption: 'GLB（纹理）',
			stlOption: 'STL（无纹理）',
			slatCfg: 'SLAT CFG Scale',
			slatCfgInfo: '模型对文本/图像的跟随程度。越高 = 越接近输入，越低 = 越有创意',
			ssCfg: 'SS CFG Scale',
			ssCfgInfo: '控制结构生成。越高 = 越忠实，越低 = 更自由的形状',
			slatSteps: 'SLAT Steps',
			slatStepsInfo: '纹理的扩散步数。越多 = 越精细，但越慢',
			ssSteps: 'SS Steps',
			ssStepsInfo: '3D结构的扩散步数。越多 = 越详细，但越慢',
			noTexture: '无纹理',
			noTextureDesc: '更快的生成',
			noTextureInfo: '跳过纹理烘焙。模型将只有灰度颜色。'
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
							<p class="text-[10px] text-muted-foreground bg-muted rounded px-2 py-1">{t[lang][`${slider.key}Info`]}</p>
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
