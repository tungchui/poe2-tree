// place files you want to import through the `$lib` alias in this folder.
import nodes from '$lib/data/nodes.json';
import nodesDesc from '$lib/data/nodes_desc.json';

export interface NodePosition {
	x: number;
	y: number;
	id: string;
}

interface NodePositionStructure {
	keystones: NodePosition[];
	notables: NodePosition[];
}

export interface TooltipContent {
	name: string;
	stats: string[];
}

export function loadData(): {
	positions: NodePositionStructure;
	nodesDescription: { [key: string]: TooltipContent };
} {
	return {
		positions: nodes,
		nodesDescription: nodesDesc
	};
}
