<script lang="ts">
	import { Loader2, Sparkles, Download, AlertCircle, Moon, Sun, Box } from 'lucide-svelte';
	import ImageUpload from '$lib/components/ImageUpload.svelte';
	import ModelViewer from '$lib/components/ModelViewer.svelte';
	import SettingsPanel from '$lib/components/SettingsPanel.svelte';
	import type { TaskStatus } from '$lib/types';

	let prompt = $state('');
	let imageData = $state('');
	let imagePreview = $state('');
	let glbBase64 = $state('');
	let status: TaskStatus = $state('idle');
	let errorMsg = $state('');
	let isDark = $state(true);

	let seed = $state(0);
	let noTexture = $state(false);
	let outputFormat = $state<'glb' | 'stl'>('glb');
	let slatCfgScale = $state(3);
	let ssCfgScale = $state(7.5);
	let slatSamplingSteps = $state(12);
	let ssSamplingSteps = $state(12);

	$effect(() => {
		if (isDark) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	});

	function toggleDark() {
		isDark = !isDark;
	}

	async function generate() {
		if (!prompt && !imageData) return;

		status = 'generating';
		errorMsg = '';
		glbBase64 = '';

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

			if (prompt) body.prompt = prompt;
			if (imageData) body.image = imageData;
			if (imageData && !prompt) body.mode = 'image';
			else body.mode = 'text';

			const res = await fetch('/api/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || `Fehler: ${res.status}`);
			}

			if (data.artifacts?.[0]?.base64) {
				glbBase64 = data.artifacts[0].base64;
				status = 'done';
			} else {
				throw new Error('Unerwartete Antwort von der API');
			}
		} catch (err) {
			status = 'error';
			errorMsg = err instanceof Error ? err.message : 'Unbekannter Fehler';
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
		a.download = `trellis-model.${outputFormat}`;
		a.click();
		URL.revokeObjectURL(url);
	}

	function canGenerate() {
		return (prompt.trim() || imageData) && status !== 'generating';
	}
</script>

<svelte:head>
	<title>TRELLIS 3D Studio</title>
	<meta name="description" content="Generate 3D models from text or images using NVIDIA TRELLIS" />
</svelte:head>

<div class="flex h-screen flex-col overflow-hidden">
	<header class="flex items-center justify-between border-b border-[var(--border)] px-6 py-3 bg-[var(--card)]">
		<div class="flex items-center gap-3">
			<Box size={24} class="text-[var(--primary)]" />
			<h1 class="text-lg font-bold tracking-tight">TRELLIS 3D Studio</h1>
			<span class="rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--primary)]">NVIDIA NIM</span>
		</div>
		<button
			onclick={toggleDark}
			class="rounded-lg p-2 text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
			aria-label="Toggle dark mode"
		>
			{#if isDark}
				<Sun size={20} />
			{:else}
				<Moon size={20} />
			{/if}
		</button>
	</header>

	<main class="flex flex-1 overflow-hidden">
		<div class="flex w-full flex-col lg:flex-row">
			<div class="flex w-full flex-col gap-5 overflow-y-auto border-r border-[var(--border)] p-6 lg:w-[420px] lg:min-w-[420px]">
				<div>
					<label for="prompt-input" class="mb-2 block text-sm font-medium">Text-Prompt</label>
					<textarea
						id="prompt-input"
						bind:value={prompt}
						placeholder="Beschreibe dein 3D-Modell... (max. 77 Zeichen)"
						maxlength="77"
						rows="3"
						class="w-full resize-none rounded-xl border border-[var(--input)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition-colors placeholder:text-[var(--muted-foreground)] focus:border-[var(--ring)] focus:ring-1 focus:ring-[var(--ring)]"
					></textarea>
					<div class="mt-1 text-right text-xs text-[var(--muted-foreground)]">{prompt.length}/77</div>
				</div>

				<div>
					<span class="mb-2 block text-sm font-medium">Bild-Upload (optional)</span>
					<ImageUpload bind:imageData bind:imagePreview />
				</div>

				<SettingsPanel
					bind:seed
					bind:noTexture
					bind:outputFormat
					bind:slatCfgScale
					bind:ssCfgScale
					bind:slatSamplingSteps
					bind:ssSamplingSteps
				/>

				<button
					onclick={generate}
					disabled={!canGenerate()}
					class="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-[var(--primary-foreground)] transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{#if status === 'generating'}
						<Loader2 size={18} class="animate-spin" />
						Generiere 3D-Modell...
					{:else}
						<Sparkles size={18} />
						3D-Modell generieren
					{/if}
				</button>

				{#if status === 'generating'}
					<div class="rounded-xl border border-[var(--primary)]/20 bg-[var(--primary)]/5 p-4">
						<div class="flex items-center gap-3">
							<Loader2 size={20} class="animate-spin text-[var(--primary)]" />
							<div>
								<p class="text-sm font-medium">Modell wird generiert</p>
								<p class="text-xs text-[var(--muted-foreground)]">Dies kann einige Minuten dauern...</p>
							</div>
						</div>
						<div class="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
							<div class="h-full animate-pulse rounded-full bg-[var(--primary)]" style="width: 60%"></div>
						</div>
					</div>
				{/if}

				{#if status === 'error'}
					<div class="rounded-xl border border-[var(--destructive)]/20 bg-[var(--destructive)]/5 p-4">
						<div class="flex items-start gap-3">
							<AlertCircle size={20} class="mt-0.5 text-[var(--destructive)] shrink-0" />
							<div>
								<p class="text-sm font-medium text-[var(--destructive)]">Fehler</p>
								<p class="text-xs text-[var(--muted-foreground)]">{errorMsg}</p>
							</div>
						</div>
					</div>
				{/if}

				{#if status === 'done' && glbBase64}
					<button
						onclick={downloadModel}
						class="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-6 py-3 text-sm font-medium transition-colors hover:bg-[var(--muted)]"
					>
						<Download size={18} />
						Modell herunterladen ({outputFormat.toUpperCase()})
					</button>
				{/if}
			</div>

			<div class="flex-1 p-6">
				<div class="h-full">
					<ModelViewer bind:glbBase64 />
				</div>
			</div>
		</div>
	</main>
</div>
