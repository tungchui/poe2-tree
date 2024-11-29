<script lang="ts">
	import nodes from '/src/data/nodes.json';
	import nodesDesc from '/src/data/nodes_desc.json';
	import { base } from '$app/paths';

	interface NodePosition {
		x: number;
		y: number;
		id: string;
	}

	interface TooltipContent {
		name: string;
		stats: string[];
	}

	let imageEl: HTMLImageElement;

	let tooltipContent: TooltipContent | null;
	let clicked = false;
	let tooltipX = 0;
	let tooltipY = 0;

	function activateTooltip(node: NodePosition) {
		tooltipContent = nodesDesc[node.id];
		console.log(tooltipContent);

		tooltipX = node.x * imageEl.width + 20; // Offset for positioning
		tooltipY = node.y * imageEl.height - 20;
	}
	function handleMousedown(node: NodePosition) {
		clicked = true;
		activateTooltip(node);
	}

	function handleMouseEnter(node: NodePosition) {
		activateTooltip(node);
		clicked = false;
	}

	function handleMouseLeave() {
		if (!clicked) {
			tooltipContent = null;
		}
	}
</script>

<h1>Path of Exile 2 Skill tree Preview</h1>

<p>Incomplete skill tree preview. Hover over the nodes to see their details.</p>
<p>Check out the Github repository for how to contribute to this project.</p>

<div class="image-container">
	<img bind:this={imageEl} src="{base}/skill-tree.png" alt="Interactive" />

	<!-- Display hoverable regions with lighter color -->
	{#each nodes.notables as node}
		<div
			class="notable"
			style="
        left: {node.x * imageEl?.width - 10}px;
        top: {node.y * imageEl?.height - 10}px;
      "
			on:mousedown={() => handleMousedown(node)}
			on:mouseenter={() => handleMouseEnter(node)}
			on:mouseleave={handleMouseLeave}
		></div>
	{/each}

	{#each nodes.keystones as node}
		<div
			class="keystone"
			style="
        left: {node.x * imageEl?.width - 10}px;
        top: {node.y * imageEl?.height - 10}px;
      "
			on:mousedown={() => handleMousedown(node)}
			on:mouseenter={() => handleMouseEnter(node)}
			on:mouseleave={handleMouseLeave}
		></div>
	{/each}

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

<style>
	.image-container {
		position: relative;
		display: inline-block;
	}

	.notable {
		position: absolute;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background-color: rgba(255, 255, 0, 0.2);
		pointer-events: auto; /* Allow mouse events */
	}
	.keystone {
		position: absolute;
		width: 25px;
		height: 25px;
		border-radius: 50%;
		background-color: rgba(255, 0, 255, 0.2);
		pointer-events: auto; /* Allow mouse events */
	}

	.tooltip {
		position: absolute;
		background-color: black; /* Dark background */
		color: white; /* White text */
		font-family: 'Georgia', serif; /* Classic serif font */
		border: 2px solid #ffffff; /* White border */
		padding: 20px;
		max-width: 400px; /* Limit width */
		margin: 0 auto; /* Center align */
		border-radius: 5px; /* Slight rounded corners */

		/* Title style */
		.title {
			font-family: 'Fontin SmallCaps', sans-serif;
			font-size: 24px;
			font-weight: bold;
			text-align: center;
			color: #e4dfd7; /* Golden-like color for title */
			margin-bottom: 15px; /* Spacing below title */
		}

		/* Body text style */
		.body {
			font-family: 'Fontin SmallCaps', sans-serif;
			font-size: 16px;
			line-height: 1.5; /* Improve readability */
			color: #7d7aad; /* Light blue for body text */
			margin-bottom: 15px; /* Spacing below body */
		}
	}
</style>
