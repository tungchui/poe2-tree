<script>
	let { children } = $props();
</script>

{@render children()}

<style>
	:global(body) {
		margin: 0;
		background-color: black;
		color: #e4dfd7;
		font-family: 'Fontin SmallCaps', sans-serif;
	}
</style>
