<script lang="ts">
	import { cn } from "$lib/utils";
	import type { Snippet } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";

	let { class: className, children, ...restProps }: HTMLButtonAttributes & { class?: string; children?: Snippet } = $props();
</script>

<button class={cn("", className)} {...restProps}>
	{#if children}{@render children()}{/if}
</button>
