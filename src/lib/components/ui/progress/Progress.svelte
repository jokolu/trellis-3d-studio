<script lang="ts">
	import { cn } from "$lib/utils";

	let { value = $bindable(0), max = 100, class: className }: { value?: number; max?: number; class?: string } = $props();
</script>

<div class={cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className)}>
	<div
		class="h-full bg-primary transition-all"
		style="width: {Math.min(100, (value / max) * 100)}%"
	></div>
</div>
