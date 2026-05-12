<script lang="ts">
	import { onMount } from 'svelte';
	import { createViewer } from '$lib/client/model-viewer';
	import { RotateCw } from 'lucide-svelte';

	let {
		glbBase64 = $bindable('')
	}: {
		glbBase64: string;
	} = $props();

	let container: HTMLElement;
	let viewer: ReturnType<typeof createViewer> | null = null;
	let viewerReady = $state(false);

	onMount(() => {
		viewer = createViewer(container);
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
</script>

<div
	bind:this={container}
	class="relative w-full h-full min-h-[400px] rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden"
>
	{#if !glbBase64}
		<div class="absolute inset-0 flex flex-col items-center justify-center text-[var(--muted-foreground)] gap-3">
			<RotateCw size={48} class="opacity-20" />
			<p class="text-sm opacity-50">3D-Vorschau erscheint hier</p>
		</div>
	{/if}
</div>
