<script lang="ts">
	import { base } from '$app/paths';
	import { type NodePosition, type TooltipContent, loadData } from '$lib';
	import { onMount } from 'svelte';

	let { positions: nodes, nodesDescription: nodesDesc } = loadData();

	let containerEl: HTMLDivElement | null = null;
	let imageEl: HTMLImageElement | null = null;
	let hasLoaded = false;

	let tooltipContent: TooltipContent | null = null;
	let tooltipHold = false;
	let tooltipX = 0;
	let tooltipY = 0;

	// State for panning
	let isPanning = false;
	let panStartX = 0;
	let panStartY = 0;
	let panOffsetX = 0;
	let panOffsetY = 0;

	// State for zoom
	let scale = 1; // Initial zoom level
	const minScale = 0.5; // Minimum zoom out level
	const maxScale = 3; // Maximum zoom in level

	// State for search
	let searchTerm = '';
	let searchResults: string[] = [];

	// Reactive statement for search
	$: handleSearch(searchTerm);

	function activateTooltip(node: NodePosition) {
		tooltipContent = nodesDesc[node.id];

		if (!imageEl) return;

		const nodeX = node.x * imageEl!.naturalWidth * scale;
		const nodeY = node.y * imageEl!.naturalHeight * scale;

		tooltipX = nodeX + 20; // Corrected position
		tooltipY = nodeY - 20; // Corrected position
	}

	function handleMousedown(node: NodePosition | null, event: MouseEvent) {
		// Prevent default image dragging and text selection

		event.preventDefault();

		if (event.button === 0) {
			// Left mouse button
			if (containerEl) {
				containerEl.focus();
			}

			isPanning = true;
			panStartX = event.clientX - panOffsetX;
			panStartY = event.clientY - panOffsetY;

			if (node) {
				tooltipHold = true;
				activateTooltip(node);
			}
		}
	}

	function handleMouseMove(event: MouseEvent) {
		if (isPanning && containerEl) {
			panOffsetX = event.clientX - panStartX;
			panOffsetY = event.clientY - panStartY;
			clampPanOffsets();
		}
	}

	function handleMouseUp(event: MouseEvent) {
		if (event.button === 0) {
			// Left mouse button
			isPanning = false;
			tooltipHold = false;
		}
	}

	function handleMouseEnter(node: NodePosition) {
		if (!isPanning) {
			activateTooltip(node);
		}
	}

	function handleMouseLeave() {
		if (!tooltipHold && !isPanning) {
			tooltipContent = null;
		}
	}

	function handleWheel(event: WheelEvent) {
		event.preventDefault();

		const zoomIntensity = 0.1;
		const wheel = event.deltaY < 0 ? 1 : -1;
		const oldScale = scale;

		// Calculate new scale
		scale += wheel * zoomIntensity * scale;
		scale = Math.max(minScale, Math.min(maxScale, scale));

		// Adjust pan offsets to zoom relative to the mouse position
		if (containerEl && imageEl) {
			const rect = containerEl.getBoundingClientRect();
			const mouseX = event.clientX - rect.left;
			const mouseY = event.clientY - rect.top;

			const nodeX = (mouseX - panOffsetX) / oldScale;
			const nodeY = (mouseY - panOffsetY) / oldScale;

			panOffsetX = mouseX - nodeX * scale;
			panOffsetY = mouseY - nodeY * scale;

			clampPanOffsets();
		}
	}

	function handleImageLoad() {
		hasLoaded = true;

		if (imageEl && containerEl) {
			const imageWidth = imageEl!.naturalWidth * scale;
			const imageHeight = imageEl!.naturalHeight * scale;
			const containerWidth = containerEl.clientWidth;
			const containerHeight = containerEl.clientHeight;

			panOffsetX = (containerWidth - imageWidth) / 2;
			panOffsetY = (containerHeight - imageHeight) / 2;
		}
	}

	function handleSearch(text: string) {
		if (!text) {
			searchResults = [];
			return;
		}

		const search = text.toLowerCase();

		searchResults = Object.entries(nodesDesc)
			.filter(
				([_, values]) =>
					values.name.toLowerCase().includes(search) ||
					values.stats.some((value) => value.toLowerCase().includes(search))
			)
			.map(([key, _]) => key);
	}

	function clampPanOffsets() {
		if (imageEl && containerEl) {
			const scaledWidth = imageEl!.naturalWidth * scale;
			const scaledHeight = imageEl!.naturalHeight * scale;
			const containerWidth = containerEl.clientWidth;
			const containerHeight = containerEl.clientHeight;

			const minPanX = containerWidth - scaledWidth;
			const minPanY = containerHeight - scaledHeight;

			panOffsetX = Math.max(minPanX, Math.min(0, panOffsetX));
			panOffsetY = Math.max(minPanY, Math.min(0, panOffsetY));
		}
	}

	// Add event listeners for global mouse events to handle panning
	onMount(() => {
		const handleMove = (event: MouseEvent) => {
			if (isPanning) {
				handleMouseMove(event);
			}
		};

		const handleUp = (event: MouseEvent) => {
			if (isPanning) {
				handleMouseUp(event);
			}
		};

		window.addEventListener('mousemove', handleMove);
		window.addEventListener('mouseup', handleUp);

		return () => {
			window.removeEventListener('mousemove', handleMove);
			window.removeEventListener('mouseup', handleUp);
		};
	});
</script>

<div style="padding-left: 16px;">
	<h1>Path of Exile 2 Skill tree Preview</h1>

	<p>Incomplete skill tree preview. Hover over the nodes to see their details.</p>
	<p>Tip: Click and Drag to pan the skill tree</p>
	<p>Check out the Github repository for how to contribute to this project.</p>
</div>

<div>
	<label for="search">Search</label>
	<input type="text" placeholder="Search..." bind:value={searchTerm} />

	<span> > Search results: {searchResults.length}</span>
</div>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	bind:this={containerEl}
	class="image-container"
	role="application"
	tabindex="-1"
	onmousedown={(event) => handleMousedown(null, event)}
	onwheel={handleWheel}
>
	<div
		class="image-wrapper"
		style="
            width: {imageEl ? imageEl.naturalWidth * scale + 'px' : 'auto'};
            height: {imageEl ? imageEl.naturalHeight * scale + 'px' : 'auto'};
            transform: translate({panOffsetX}px, {panOffsetY}px);
            user-select: none;
            cursor: {isPanning ? 'grabbing' : 'grab'};
        "
	>
		<img
			bind:this={imageEl}
			onload={handleImageLoad}
			src="{base}/skill-tree.png"
			alt="Interactive"
			draggable="false"
			style="
                pointer-events: none;
                max-width: none;
                width: {imageEl ? imageEl.naturalWidth * scale + 'px' : 'auto'};
                height: {imageEl ? imageEl.naturalHeight * scale + 'px' : 'auto'};
            "
		/>

		<!-- Display hoverable regions with lighter color -->
		{#if hasLoaded}
			{#each ['notables', 'keystones'] as kind}
				{#each nodes[kind] as node}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class:notable={node.id.startsWith('N')}
						class:keystone={node.id.startsWith('K')}
						class:unidentified={nodesDesc[node.id].name === node.id}
						class:search-result={searchResults.includes(node.id)}
						style="
                            left: {node.x * imageEl!.naturalWidth * scale - 10}px;
                            top: {node.y * imageEl!.naturalHeight * scale - 10}px;
                        "
						onmousedown={(event) => handleMousedown(node, event)}
						onmouseenter={() => handleMouseEnter(node)}
						onmouseleave={handleMouseLeave}
					></div>
				{/each}
			{/each}
		{/if}

		<!-- Tooltip displayed when a region is hovered -->
		{#if tooltipContent != null}
			<div class="tooltip" style="left: {tooltipX}px; top: {tooltipY}px;">
				<div class="title">{tooltipContent.name}</div>
				{#each tooltipContent.stats as stat}
					<div class="body">{stat}</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.image-container {
		position: relative;
		display: inline-block;
		overflow: hidden;
		outline: none;
		width: 100vw;
		height: 80vh;
	}

	.image-wrapper {
		position: absolute;
		top: 0;
		left: 0;
	}

	.notable,
	.keystone {
		position: absolute;
		pointer-events: auto;
	}

	.notable {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background-color: rgba(255, 255, 0, 0.2);
	}

	.notable.unidentified {
		background-color: rgba(255, 100, 100, 0.2);
	}

	.keystone {
		width: 25px;
		height: 25px;
		border-radius: 50%;
		background-color: rgba(100, 255, 100, 0.2);
	}

	.keystone.unidentified {
		background-color: rgba(255, 0, 100, 0.2);
	}

	.search-result {
		border: 2px solid rgba(255, 0, 0, 0.8);
	}

	.tooltip {
		position: absolute;
		background-color: black;
		color: white;
		font-family: 'Georgia', serif;
		border: 2px solid #ffffff;
		padding: 20px;
		max-width: 400px;
		border-radius: 5px;
	}

	.tooltip .title {
		font-family: 'Fontin SmallCaps', sans-serif;
		font-size: 24px;
		font-weight: bold;
		text-align: center;
		color: #e4dfd7;
		margin-bottom: 15px;
	}

	.tooltip .body {
		font-family: 'Fontin SmallCaps', sans-serif;
		font-size: 16px;
		line-height: 1.5;
		color: #7d7aad;
		margin-bottom: 15px;
	}
</style>
