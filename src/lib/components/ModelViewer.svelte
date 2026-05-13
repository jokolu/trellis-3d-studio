<script lang="ts">
	import { onMount } from 'svelte';
	import { createViewer } from '$lib/client/model-viewer';
	import { RotateCw, Camera, RotateCcw, Sun, SunMedium } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import type { Lang } from '$lib/i18n';

	let {
		glbBase64 = $bindable(''),
		lang = 'de'
	}: {
		glbBase64: string;
		lang: Lang;
	} = $props();

	let container: HTMLElement;
	let canvasContainer: HTMLElement;
	let viewer: ReturnType<typeof createViewer> | null = null;
	let viewerReady = $state(false);
	let autoRotate = $state(false);
	let sunEnabled = $state(true);

	const t: Record<Lang, Record<string, string>> = {
		de: { placeholder: '3D-Vorschau erscheint hier', cameraReset: 'Kamera zurücksetzen', autoRotate: 'Auto-Rotation', screenshot: 'Screenshot', sunToggle: 'Sonne ein/aus' },
		en: { placeholder: '3D preview will appear here', cameraReset: 'Reset camera', autoRotate: 'Auto-rotate', screenshot: 'Screenshot', sunToggle: 'Toggle sun' },
		fr: { placeholder: 'L\'aperçu 3D apparaîtra ici', cameraReset: 'Réinitialiser la caméra', autoRotate: 'Rotation auto', screenshot: 'Capture d\'écran', sunToggle: 'Activer/désactiver le soleil' },
		es: { placeholder: 'La vista previa 3D aparecerá aquí', cameraReset: 'Restablecer cámara', autoRotate: 'Auto-rotación', screenshot: 'Captura de pantalla', sunToggle: 'Activar/desactivar sol' },
		it: { placeholder: 'L\'anteprima 3D apparirà qui', cameraReset: 'Ripristina fotocamera', autoRotate: 'Auto-rotazione', screenshot: 'Screenshot', sunToggle: 'Attiva/disattiva sole' },
		pt: { placeholder: 'A visualização 3D aparecerá aqui', cameraReset: 'Redefinir câmera', autoRotate: 'Auto-rotação', screenshot: 'Captura de tela', sunToggle: 'Ativar/desativar sol' },
		ja: { placeholder: '3Dプレビューがここに表示されます', cameraReset: 'カメラをリセット', autoRotate: '自動回転', screenshot: 'スクリーンショット', sunToggle: '太陽の切替' },
		zh: { placeholder: '3D预览将显示在这里', cameraReset: '重置相机', autoRotate: '自动旋转', screenshot: '截图', sunToggle: '切换阳光' }
	};

	onMount(() => {
		viewer = createViewer(canvasContainer);
		viewerReady = true;

		const ro = new ResizeObserver(() => {
			viewer?.resize();
		});
		ro.observe(container);

		return () => {
			ro.disconnect();
			viewer?.destroy();
		};
	});

	$effect(() => {
		if (glbBase64 && viewerReady && viewer) {
			viewer.loadGlb(glbBase64);
		}
	});

	$effect(() => {
		if (viewer) {
			viewer.setAutoRotate(autoRotate);
		}
	});

	$effect(() => {
		if (viewer) {
			viewer.setSunEnabled(sunEnabled);
		}
	});

	function takeScreenshot() {
		if (!viewer) return;
		const dataUrl = viewer.takeScreenshot();
		if (dataUrl) {
			const a = document.createElement('a');
			a.href = dataUrl;
			a.download = `3d-visualizer-screenshot-${Date.now()}.png`;
			a.click();
		}
	}

	function resetCamera() {
		viewer?.resetCamera();
	}
</script>

<div
	bind:this={container}
	class="relative w-full h-full min-h-[400px] rounded-xl border bg-card overflow-hidden"
>
	<div bind:this={canvasContainer} class="w-full h-full"></div>

	{#if !glbBase64}
		<div class="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-3 pointer-events-none">
			<RotateCw size={48} class="opacity-15" />
			<p class="text-sm opacity-40">{t[lang].placeholder}</p>
		</div>
	{/if}

	{#if glbBase64}
		<div class="absolute bottom-4 right-4 flex items-center gap-1.5">
			<Button
				variant={sunEnabled ? 'default' : 'secondary'}
				size="icon"
				class="h-8 w-8 shadow-md"
				onclick={() => (sunEnabled = !sunEnabled)}
				title={t[lang].sunToggle}
			>
				{#if sunEnabled}
					<Sun size={14} />
				{:else}
					<SunMedium size={14} />
				{/if}
			</Button>
			<Button variant="secondary" size="icon" class="h-8 w-8 shadow-md" onclick={resetCamera} title={t[lang].cameraReset}>
				<RotateCcw size={14} />
			</Button>
			<Button
				variant={autoRotate ? 'default' : 'secondary'}
				size="icon"
				class="h-8 w-8 shadow-md"
				onclick={() => (autoRotate = !autoRotate)}
				title={t[lang].autoRotate}
			>
				<RotateCw size={14} />
			</Button>
			<Button variant="secondary" size="icon" class="h-8 w-8 shadow-md" onclick={takeScreenshot} title={t[lang].screenshot}>
				<Camera size={14} />
			</Button>
		</div>
	{/if}
</div>
