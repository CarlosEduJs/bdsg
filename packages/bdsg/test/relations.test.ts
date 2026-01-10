import { describe, expect, test } from "bun:test";
import {
	detectRelations,
	type Node,
	wouldCreateDirectCycle,
} from "../src/relations";

describe("Relations Detection", () => {
	const existingNodes: Node[] = [
		{
			id: "node-1",
			type: "token",
			category: "color",
			name: "primary",
			value: "#0000FF",
		},
		{
			id: "node-2",
			type: "token",
			category: "spacing",
			name: "spacing-base",
			value: "16px",
		},
		{
			id: "node-3",
			type: "token",
			category: "color",
			name: "secondary",
			value: "#FF0000",
		},
	];

	describe("Paired Naming Pattern", () => {
		test("detects -text suffix (primary-text → primary)", () => {
			const newNode: Node = {
				id: "node-4",
				type: "token",
				category: "color",
				name: "primary-text",
				value: "#FFFFFF",
			};

			const relations = detectRelations(newNode, existingNodes);

			expect(relations).toHaveLength(1);
			expect(relations[0]).toMatchObject({
				fromNodeId: "node-4",
				toNodeId: "node-1",
				type: "uses",
				confidence: 0.9,
			});
			expect(relations[0]?.reason).toContain("paired naming pattern");
		});

		test("detects -bg suffix (primary-bg → primary)", () => {
			const newNode: Node = {
				id: "node-5",
				type: "token",
				category: "color",
				name: "primary-bg",
				value: "#0000FF",
			};

			const relations = detectRelations(newNode, existingNodes);

			expect(relations).toHaveLength(1);
			expect(relations[0]?.toNodeId).toBe("node-1");
		});

		test("detects -border suffix", () => {
			const newNode: Node = {
				id: "node-6",
				type: "token",
				category: "color",
				name: "primary-border",
				value: "#0000FF",
			};

			const relations = detectRelations(newNode, existingNodes);

			expect(relations).toHaveLength(1);
			expect(relations[0]?.type).toBe("uses");
		});

		test("detects -hover suffix", () => {
			const newNode: Node = {
				id: "node-7",
				type: "token",
				category: "color",
				name: "primary-hover",
				value: "#0000CC",
			};

			const relations = detectRelations(newNode, existingNodes);

			expect(relations).toHaveLength(1);
		});

		test("does not detect false positive for non-paired naming", () => {
			const newNode: Node = {
				id: "node-fp-1",
				type: "token",
				category: "color",
				name: "primary-alt-text",
				value: "#FFFFFF",
			};

			const relations = detectRelations(newNode, existingNodes);

			expect(relations).toHaveLength(0);
		});
	});

	describe("Hierarchical Naming Pattern", () => {
		test("detects -sm depending on -base (spacing-sm → spacing-base)", () => {
			const newNode: Node = {
				id: "node-8",
				type: "token",
				category: "spacing",
				name: "spacing-sm",
				value: "8px",
			};

			const relations = detectRelations(newNode, existingNodes);

			expect(relations).toHaveLength(1);
			expect(relations[0]).toMatchObject({
				fromNodeId: "node-8",
				toNodeId: "node-2",
				type: "depends_on",
				confidence: 0.7,
			});
		});

		test("does not match across different categories", () => {
			const newNode: Node = {
				id: "node-cross-cat",
				type: "token",
				category: "color",
				name: "spacing-sm",
				value: "#123456",
			};

			const relations = detectRelations(newNode, existingNodes);

			expect(relations).toHaveLength(0);
		});

		test("does not suggest for base tokens themselves", () => {
			const newNode: Node = {
				id: "node-is-base",
				type: "token",
				category: "spacing",
				name: "font-base",
				value: "16px",
			};

			const relations = detectRelations(newNode, existingNodes);

			expect(relations).toHaveLength(0);
		});
	});

	describe("Palette Shade Pattern", () => {
		test("detects shade 500 (primary-500 → primary)", () => {
			const newNode: Node = {
				id: "node-9",
				type: "token",
				category: "color",
				name: "primary-500",
				value: "#0000FF",
			};

			const relations = detectRelations(newNode, existingNodes);

			expect(relations).toHaveLength(1);
			expect(relations[0]).toMatchObject({
				fromNodeId: "node-9",
				toNodeId: "node-1",
				type: "uses",
				confidence: 0.8,
			});
			expect(relations[0]?.reason).toContain("shade 500");
		});

		test("detects shade 100", () => {
			const newNode: Node = {
				id: "node-10",
				type: "token",
				category: "color",
				name: "primary-100",
				value: "#CCCCFF",
			};

			const relations = detectRelations(newNode, existingNodes);

			expect(relations).toHaveLength(1);
			expect(relations[0]?.reason).toContain("shade 100");
		});

		test("only matches color category", () => {
			const newNode: Node = {
				id: "node-not-color",
				type: "token",
				category: "spacing",
				name: "primary-500",
				value: "500px",
			};

			const relations = detectRelations(newNode, existingNodes);

			expect(relations).toHaveLength(0);
		});
	});

	describe("General Behavior", () => {
		test("returns empty array when no patterns match", () => {
			const newNode: Node = {
				id: "node-11",
				type: "token",
				category: "radius",
				name: "border-radius",
				value: "4px",
			};

			const relations = detectRelations(newNode, existingNodes);

			expect(relations).toHaveLength(0);
		});

		test("heuristic detection confidence is always < 1.0", () => {
			const newNode: Node = {
				id: "node-12",
				type: "token",
				category: "color",
				name: "primary-text",
				value: "#FFFFFF",
			};

			const relations = detectRelations(newNode, existingNodes);

			expect(relations[0]?.confidence).toBeLessThan(1.0);
		});

		test("sorts relations by confidence descending", () => {
			// Add a node that matches multiple patterns with different confidences
			const nodesWithMultiple: Node[] = [
				...existingNodes,
				{
					id: "node-extra",
					type: "token",
					category: "color",
					name: "brand-base",
					value: "#FF0000",
				},
			];

			const newNode: Node = {
				id: "node-13",
				type: "token",
				category: "color",
				name: "brand-text",
				value: "#FFFFFF",
			};

			const relations = detectRelations(newNode, nodesWithMultiple);

			// Should be sorted by confidence
			for (let i = 0; i < relations.length - 1; i++) {
				expect(relations[i]?.confidence).toBeGreaterThanOrEqual(
					relations[i + 1]?.confidence ?? 0,
				);
			}
		});
	});

	describe("wouldCreateDirectCycle", () => {
		test("returns true for self-reference", () => {
			expect(wouldCreateDirectCycle("node-1", "node-1")).toBe(true);
		});

		test("returns false for different nodes", () => {
			expect(wouldCreateDirectCycle("node-1", "node-2")).toBe(false);
		});
	});
});
