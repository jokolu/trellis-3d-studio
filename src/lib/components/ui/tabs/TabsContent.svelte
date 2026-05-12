<script lang="ts">
	import { cn } from "$lib/utils";
	import type { Snippet } from "svelte";

	let { value, class: className, children, rootValue }: { value: string; class?: string; children?: Snippet; rootValue?: string } = $props();

	let isActive = $derived(rootValue === value);
</script>

{#if isActive}
	<div class={cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)}>
		{#if children}{@render children()}{/if}
	</div>
{/if}
