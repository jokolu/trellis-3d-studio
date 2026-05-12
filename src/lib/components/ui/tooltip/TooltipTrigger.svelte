<script lang="ts">
	import { cn } from "$lib/utils";
	import type { Snippet } from "svelte";

	let { class: className, children }: { class?: string; children?: Snippet } = $props();
</script>

<div class="relative inline-flex" role="group" onmouseenter={() => {}} onmouseleave={() => {}}>
	{#if children}{@render children()}{/if}
</div>
