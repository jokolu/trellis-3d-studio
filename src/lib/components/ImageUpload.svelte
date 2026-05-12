<script lang="ts">
	import { ImagePlus, X, Upload } from 'lucide-svelte';

	type Lang = 'de' | 'en';

	let {
		imageData = $bindable(''),
		imagePreview = $bindable(''),
		lang = 'de'
	}: {
		imageData: string;
		imagePreview: string;
		lang: Lang;
	} = $props();

	let fileInput: HTMLInputElement;
	let isDragging = $state(false);

	const t = {
		de: {
			dropImage: 'Bild hierher ziehen oder klicken',
			imageFormats: 'PNG, JPG, WebP',
			removeImage: 'Bild entfernen'
		},
		en: {
			dropImage: 'Drag image here or click',
			imageFormats: 'PNG, JPG, WebP',
			removeImage: 'Remove image'
		}
	};

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

<div
	class="relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-all cursor-pointer
		{isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-muted hover:border-primary/40 hover:bg-accent/50'}
		{imagePreview ? 'p-2 border-solid border-border' : ''}"
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
			<img src={imagePreview} alt="Upload preview" class="max-h-48 mx-auto rounded-md object-contain" />
			<button
				class="absolute top-2 right-2 rounded-full bg-destructive p-1.5 text-destructive-foreground shadow-md transition-transform hover:scale-110"
				onclick={(e) => { e.stopPropagation(); clearImage(); }}
				aria-label={t[lang].removeImage}
			>
				<X size={14} />
			</button>
		</div>
	{:else}
		<div class="flex flex-col items-center gap-2 text-muted-foreground py-4">
			<div class="rounded-full bg-accent p-3">
				{#if isDragging}
					<Upload size={24} class="text-primary" />
				{:else}
					<ImagePlus size={24} />
				{/if}
			</div>
			<span class="text-sm font-medium">{t[lang].dropImage}</span>
			<span class="text-xs">{t[lang].imageFormats}</span>
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
