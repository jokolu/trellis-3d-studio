<script lang="ts">
	import { ImagePlus, X, Upload } from 'lucide-svelte';

	let {
		imageData = $bindable(''),
		imagePreview = $bindable('')
	}: {
		imageData: string;
		imagePreview: string;
	} = $props();

	let fileInput: HTMLInputElement;
	let isDragging = $state(false);

	function handleFile(file: File) {
		if (!file.type.startsWith('image/')) return;
		const reader = new FileReader();
		reader.onload = (e) => {
			const dataUrl = e.target?.result as string;
			imagePreview = dataUrl;
			imageData = dataUrl;
		};
		reader.readAsDataURL(file);
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
		const file = e.dataTransfer?.files?.[0];
		if (file) handleFile(file);
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		isDragging = true;
	}

	function handleDragLeave() {
		isDragging = false;
	}

	function handleInputChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) handleFile(file);
	}

	function clearImage() {
		imageData = '';
		imagePreview = '';
		if (fileInput) fileInput.value = '';
	}
</script>

<div class="space-y-2">
	<div
		class="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors cursor-pointer
			{isDragging ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-[var(--border)] hover:border-[var(--primary)]/50 hover:bg-[var(--muted)]'}
			{imagePreview ? 'p-2' : ''}"
		ondrop={handleDrop}
		ondragover={handleDragOver}
		ondragleave={handleDragLeave}
		onclick={() => fileInput.click()}
		role="button"
		tabindex="0"
		onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInput.click(); }}
	>
		{#if imagePreview}
			<div class="relative w-full">
				<img src={imagePreview} alt="Upload preview" class="max-h-48 mx-auto rounded-lg object-contain" />
				<button
					class="absolute top-2 right-2 rounded-full bg-[var(--destructive)] p-1 text-white shadow-lg transition-transform hover:scale-110"
					onclick={(e) => { e.stopPropagation(); clearImage(); }}
					aria-label="Remove image"
				>
					<X size={16} />
				</button>
			</div>
		{:else}
			<div class="flex flex-col items-center gap-2 text-[var(--muted-foreground)]">
				<div class="rounded-full bg-[var(--muted)] p-3">
					{#if isDragging}
						<Upload size={24} class="text-[var(--primary)]" />
					{:else}
						<ImagePlus size={24} />
					{/if}
				</div>
				<span class="text-sm font-medium">Bild hierher ziehen oder klicken</span>
				<span class="text-xs">PNG, JPG, WebP</span>
			</div>
		{/if}
	</div>
	<input
		bind:this={fileInput}
		type="file"
		accept="image/png,image/jpeg,image/webp"
		class="hidden"
		onchange={handleInputChange}
	/>
</div>
