<script lang="ts">
	import { cn } from "$lib/utils";
	import type { Snippet } from "svelte";

	let { open = $bindable(false), class: className, children }: { open?: boolean; class?: string; children?: Snippet } = $props();
</script>

<div class={cn("", className)} data-collapsible={open}>
	{#if children}{@render children()}{/if}
</div>
