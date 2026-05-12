<script lang="ts">
	import { cn } from "$lib/utils";
	import type { Snippet } from "svelte";

	let { class: className, children }: { class?: string; children?: Snippet } = $props();
</script>

<div class={cn("rounded-lg border bg-popover p-1 text-popover-foreground shadow-md", className)}>
	{#if children}{@render children()}{/if}
</div>
