<script lang="ts">
	import { onMount } from 'svelte';
	import { createViewer } from '$lib/client/model-viewer';
	import { RotateCw, Camera, RotateCcw } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';

	type Lang = 'de' | 'en';

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

	const t = {
		de: {
			placeholder: '3D-Vorschau erscheint hier',
			cameraReset: 'Kamera zurücksetzen',
			autoRotate: 'Auto-Rotation',
			screenshot: 'Screenshot'
		},
		en: {
			placeholder: '3D preview will appear here',
			cameraReset: 'Reset camera',
			autoRotate: 'Auto-rotate',
			screenshot: 'Screenshot'
		}
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
