<script lang="ts">
	import { Settings } from 'lucide-svelte';

	let {
		seed = $bindable(0),
		noTexture = $bindable(false),
		outputFormat = $bindable<'glb' | 'stl'>('glb'),
		slatCfgScale = $bindable(3),
		ssCfgScale = $bindable(7.5),
		slatSamplingSteps = $bindable(12),
		ssSamplingSteps = $bindable(12)
	}: {
		seed: number;
		noTexture: boolean;
		outputFormat: 'glb' | 'stl';
		slatCfgScale: number;
		ssCfgScale: number;
		slatSamplingSteps: number;
		ssSamplingSteps: number;
	} = $props();

	let expanded = $state(false);
</script>

<div class="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
	<button
		class="flex w-full items-center justify-between p-3 text-sm font-medium hover:bg-[var(--muted)] transition-colors"
		onclick={() => (expanded = !expanded)}
	>
		<span class="flex items-center gap-2">
			<Settings size={16} />
			Erweiterte Einstellungen
		</span>
		<span class="text-[var(--muted-foreground)] text-xs">{expanded ? 'Verbergen' : 'Anzeigen'}</span>
	</button>

	{#if expanded}
		<div class="border-t border-[var(--border)] p-4 space-y-4">
			<div class="grid grid-cols-2 gap-4">
				<label class="space-y-1">
					<span class="text-xs font-medium text-[var(--muted-foreground)]">Seed</span>
					<input
						type="number"
						bind:value={seed}
						min="0"
						class="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--ring)] focus:ring-1 focus:ring-[var(--ring)]"
					/>
				</label>

				<label class="space-y-1">
					<span class="text-xs font-medium text-[var(--muted-foreground)]">Format</span>
					<select
						bind:value={outputFormat}
						class="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--ring)] focus:ring-1 focus:ring-[var(--ring)]"
					>
						<option value="glb">GLB</option>
						<option value="stl">STL</option>
					</select>
				</label>

				<label class="space-y-1">
					<span class="text-xs font-medium text-[var(--muted-foreground)]">SLAT CFG Scale ({slatCfgScale})</span>
					<input
						type="range"
						bind:value={slatCfgScale}
						min="1"
						max="10"
						step="0.5"
						class="w-full accent-[var(--primary)]"
					/>
				</label>

				<label class="space-y-1">
					<span class="text-xs font-medium text-[var(--muted-foreground)]">SS CFG Scale ({ssCfgScale})</span>
					<input
						type="range"
						bind:value={ssCfgScale}
						min="1"
						max="10"
						step="0.5"
						class="w-full accent-[var(--primary)]"
					/>
				</label>

				<label class="space-y-1">
					<span class="text-xs font-medium text-[var(--muted-foreground)]">SLAT Steps ({slatSamplingSteps})</span>
					<input
						type="range"
						bind:value={slatSamplingSteps}
						min="10"
						max="50"
						step="1"
						class="w-full accent-[var(--primary)]"
					/>
				</label>

				<label class="space-y-1">
					<span class="text-xs font-medium text-[var(--muted-foreground)]">SS Steps ({ssSamplingSteps})</span>
					<input
						type="range"
						bind:value={ssSamplingSteps}
						min="10"
						max="50"
						step="1"
						class="w-full accent-[var(--primary)]"
					/>
				</label>
			</div>

			<label class="flex items-center gap-2 text-sm">
				<input
					type="checkbox"
					bind:checked={noTexture}
					class="rounded accent-[var(--primary)]"
				/>
				<span>Keine Textur (schneller)</span>
			</label>
		</div>
	{/if}
</div>
