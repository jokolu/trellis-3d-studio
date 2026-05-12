<script lang="ts">
	import { cn } from "$lib/utils";
	import type { Snippet } from "svelte";

	let { value = $bindable("text"), class: className, children }: { value?: string; class?: string; children?: Snippet } = $props();
</script>

<div class={cn("w-full", className)} data-tabs-root={value}>
	{#if children}{@render children()}{/if}
</div>
