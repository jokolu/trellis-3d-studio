<script lang="ts">
	import { cn } from "$lib/utils";
	import type { Snippet } from "svelte";

	let { value, class: className, children, rootValue }: { value: string; class?: string; children?: Snippet; rootValue?: string } = $props();

	let isActive = $derived(rootValue === value);
</script>

<button
	class={cn(
		"inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
		isActive ? "bg-background text-foreground shadow-sm" : "",
		className
	)}
	onclick={() => {}}
>
	{#if children}{@render children()}{/if}
</button>
