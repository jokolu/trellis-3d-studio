<script lang="ts">
	import { cn } from "$lib/utils";
	import type { Snippet } from "svelte";

	let { class: className, children, ...restProps }: { class?: string; children?: Snippet; [key: string]: unknown } = $props();
</script>

<div class={cn("rounded-xl border bg-card text-card-foreground shadow-sm", className)} {...restProps}>
	{#if children}{@render children()}{/if}
</div>
