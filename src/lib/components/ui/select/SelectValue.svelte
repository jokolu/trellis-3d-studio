<script lang="ts">
	import { cn } from "$lib/utils";
	import type { Snippet } from "svelte";

	let { class: className, children }: { class?: string; children?: Snippet } = $props();
</script>

<span class={cn("", className)}>
	{#if children}{@render children()}{/if}
</span>
