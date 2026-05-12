<script lang="ts">
	import { cn } from "$lib/utils";
	import type { Snippet } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";

	let { class: className, children, ...restProps }: HTMLButtonAttributes & { class?: string; children?: Snippet } = $props();
</script>

<button
	class={cn("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground", className)}
	{...restProps}
>
	{#if children}{@render children()}{/if}
</button>
