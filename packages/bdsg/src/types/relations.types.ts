/**
 * Relations detection type definitions
 */

/**
 * Design token node
 */
export interface Node {
	id: string;
	type: string;
	category: string;
	name: string;
	value: unknown;
}

/**
 * Relation suggestion with confidence score
 */
export interface RelationSuggestion {
	fromNodeId: string;
	toNodeId: string;
	type: "uses" | "depends_on";
	confidence: number; // 0-1
	reason: string;
}
