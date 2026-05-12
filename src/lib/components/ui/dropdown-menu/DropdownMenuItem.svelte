<script lang="ts">
	import { cn } from "$lib/utils";
	import type { Snippet } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";

	let { class: className, children, ...restProps }: HTMLButtonAttributes & { class?: string; children?: Snippet } = $props();
</script>

<button
	class={cn("relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground w-full text-left", className)}
	{...restProps}
>
	{#if children}{@render children()}{/if}
</button>
