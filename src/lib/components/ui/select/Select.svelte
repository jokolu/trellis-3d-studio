<script lang="ts">
	import { cn } from "$lib/utils";
	import type { Snippet } from "svelte";

	let { value = $bindable("glb"), class: className, children }: { value?: string; class?: string; children?: Snippet } = $props();
</script>

<div class={cn("", className)}>
	{#if children}{@render children()}{/if}
</div>
