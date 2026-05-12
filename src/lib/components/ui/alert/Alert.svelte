<script lang="ts">
	import { cn } from "$lib/utils";
	import type { Snippet } from "svelte";

	type Variant = "default" | "destructive";

	let { variant = "default", class: className, children }: { variant?: Variant; class?: string; children?: Snippet } = $props();
</script>

<div class={cn(
	"relative w-full rounded-lg border p-4",
	variant === "destructive" ? "border-destructive/50 text-destructive [&>svg]:text-destructive" : "",
	className
)} role="alert">
	{#if children}{@render children()}{/if}
</div>
