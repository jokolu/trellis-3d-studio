<script lang="ts">
	import '../app.css';
	import { Toaster } from '$lib/components/ui/sonner';
	import { onMount } from 'svelte';
	import { themeStore } from '$lib/theme';

	let { children } = $props();

	onMount(() => {
		themeStore.initialize();
	});
</script>

<Toaster />
{@render children()}
