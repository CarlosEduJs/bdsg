/**
 * Relations Detection
 *
 * Auto-detects relations between design tokens based on naming patterns
 * and semantic conventions. Uses heuristics only - no metadata dependencies.
 */

export type { Node, RelationSuggestion } from "./types/relations.types";

import type { Node, RelationSuggestion } from "./types/relations.types";

/**
 * Detects potential relations for a node using naming pattern heuristics.
 *
 * Uses multiple detection patterns:
 * - Paired naming: "-text", "-bg", "-border", "-hover" suffixes
 * - Hierarchical naming: "-base", "-default", "-primary" suffixes
 * - Palette patterns: shade numbers (50-900) linking to base color
 *
 * @param newNode - The node to find relations for
 * @param existingNodes - Array of existing nodes to compare against
 * @returns Array of relation suggestions sorted by confidence (highest first)
 *
 * @example
 * ```typescript
 * const relations = detectRelations(
 *   { id: "1", name: "primary-text", category: "color", type: "token", value: "#fff" },
 *   [{ id: "2", name: "primary", category: "color", type: "token", value: "#3B82F6" }]
 * );
 * // [{ fromNodeId: "1", toNodeId: "2", type: "uses", confidence: 0.9, reason: "..." }]
 * ```
 */
export function detectRelations(
	newNode: Node,
	existingNodes: Node[],
): RelationSuggestion[] {
	const suggestions: RelationSuggestion[] = [];

	// Pattern 1: Paired naming (e.g., "primary-text" uses "primary")
	const pairedRelations = detectPairedNaming(newNode, existingNodes);
	suggestions.push(...pairedRelations);

	// Pattern 2: Hierarchical naming (e.g., "spacing-sm" depends on "spacing-base")
	const hierarchicalRelations = detectHierarchicalNaming(
		newNode,
		existingNodes,
	);
	suggestions.push(...hierarchicalRelations);

	// Pattern 3: Color palette relations (e.g., "primary-500" is part of "primary" palette)
	const paletteRelations = detectPaletteRelations(newNode, existingNodes);
	suggestions.push(...paletteRelations);

	// Sort by confidence descending (highest confidence first)
	return suggestions.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Pattern 1: Paired Naming
 *
 * Detects tokens with common suffixes that indicate a relationship
 * to a base token (e.g., "primary-text" uses "primary").
 */
function detectPairedNaming(
	newNode: Node,
	existingNodes: Node[],
): RelationSuggestion[] {
	const suggestions: RelationSuggestion[] = [];

	// Suffixes that indicate a paired relationship
	const pairSuffixes = ["-text", "-bg", "-background", "-border", "-hover"];

	for (const suffix of pairSuffixes) {
		if (newNode.name.endsWith(suffix)) {
			// Extract base name (e.g., "primary-text" -> "primary")
			const baseName = newNode.name.slice(0, -suffix.length);

			// Find matching base token
			const baseToken = existingNodes.find((n) => n.name === baseName);

			if (baseToken) {
				suggestions.push({
					fromNodeId: newNode.id,
					toNodeId: baseToken.id,
					type: "uses",
					confidence: 0.9,
					reason: `Token "${newNode.name}" uses "${baseName}" (paired naming pattern)`,
				});
			}
		}
	}

	return suggestions;
}

/**
 * Pattern 2: Hierarchical Naming
 *
 * Detects base/derived relationships based on common naming patterns
 * (e.g., "spacing-sm" depends on "spacing-base").
 */
function detectHierarchicalNaming(
	newNode: Node,
	existingNodes: Node[],
): RelationSuggestion[] {
	const suggestions: RelationSuggestion[] = [];

	// Common base suffixes
	const baseSuffixes = ["-base", "-default", "-primary"];

	// Extract prefix (e.g., "spacing-sm" -> "spacing")
	const parts = newNode.name.split("-");
	if (parts.length < 2) return suggestions;

	const prefix = parts[0]; // e.g., "spacing"

	// Skip if this IS the base
	if (baseSuffixes.some((suffix) => newNode.name.endsWith(suffix))) {
		return suggestions;
	}

	// Look for base token with same prefix and category
	for (const suffix of baseSuffixes) {
		const baseName = `${prefix}${suffix}`;
		const baseToken = existingNodes.find((n) => n.name === baseName);

		if (baseToken && baseToken.category === newNode.category) {
			suggestions.push({
				fromNodeId: newNode.id,
				toNodeId: baseToken.id,
				type: "depends_on",
				confidence: 0.7,
				reason: `Token "${newNode.name}" likely derives from "${baseName}"`,
			});
			break; // Only suggest one base
		}
	}

	return suggestions;
}

/**
 * Pattern 3: Color Palette Relations
 *
 * Detects palette shades using the common 50-900 shade naming pattern
 * (e.g., "primary-500" is part of "primary" palette).
 */
function detectPaletteRelations(
	newNode: Node,
	existingNodes: Node[],
): RelationSuggestion[] {
	const suggestions: RelationSuggestion[] = [];

	// Only for color tokens
	if (newNode.category !== "color") return suggestions;

	// Check if name ends with shade number (e.g., -50, -100, -500)
	const shadePattern = /^(.+?)-(50|100|200|300|400|500|600|700|800|900)$/;
	const match = newNode.name.match(shadePattern);

	if (match) {
		const paletteName = match[1]; // e.g., "primary"
		const shade = match[2]; // e.g., "500"

		// Look for base palette token (without shade number)
		const baseToken = existingNodes.find(
			(n) => n.name === paletteName && n.category === "color",
		);

		if (baseToken) {
			suggestions.push({
				fromNodeId: newNode.id,
				toNodeId: baseToken.id,
				type: "uses",
				confidence: 0.8,
				reason: `Token "${newNode.name}" is shade ${shade} of "${paletteName}" palette`,
			});
		}
	}

	return suggestions;
}

/**
 * Checks if a relation would create a direct self-reference cycle.
 *
 * @param fromNodeId - Source node ID
 * @param toNodeId - Target node ID
 * @returns True if the relation would create a direct cycle (A -> A)
 *
 * @example
 * ```typescript
 * wouldCreateDirectCycle("node-1", "node-1")  // true (self-reference)
 * wouldCreateDirectCycle("node-1", "node-2")  // false
 * ```
 */
export function wouldCreateDirectCycle(
	fromNodeId: string,
	toNodeId: string,
): boolean {
	return fromNodeId === toNodeId;
}
