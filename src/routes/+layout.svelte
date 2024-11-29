<script>
	let { children } = $props();
</script>

{@render children()}

<style>
	:global(body) {
		/* applies to <body> */
		margin: 0;
		background-color: black;
		color: #e4dfd7;
		font-family: 'Fontin SmallCaps', sans-serif;
	}
</style>
