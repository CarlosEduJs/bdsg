import { describe, expect, test } from "bun:test";
import {
	generateShadows,
	generateShadowTokens,
	SHADOW_PRESETS,
} from "../src/shadows";

describe("Shadow Generation", () => {
	describe("generateShadows", () => {
		test("should generate default shadow scale", () => {
			const scale = generateShadows();
			expect(scale.tokens.length).toBe(7); // none + 6 levels
			expect(scale.tokens[0]?.name).toBe("none");
			expect(scale.tokens[0]?.value).toBe("none");
		});

		test("should generate correct number of levels", () => {
			const scale = generateShadows({ levels: 4 });
			expect(scale.tokens.length).toBe(5); // none + 4 levels
		});

		test("should use custom color", () => {
			const scale = generateShadows({ color: "#FF0000" });
			expect(scale.color).toBe("#FF0000");
			expect(scale.tokens[1]?.value).toContain("rgba(255, 0, 0,");
		});

		test("should generate material style shadows with multiple layers", () => {
			const scale = generateShadows({ style: "material", layered: true });
			// Material shadows have 3 layers (umbra, penumbra, ambient)
			expect(scale.tokens[1]?.layers.length).toBe(3);
		});

		test("should generate soft shadows with single layer", () => {
			const scale = generateShadows({ style: "soft" });
			expect(scale.tokens[1]?.layers.length).toBe(1);
		});

		test("should generate inset shadows", () => {
			const scale = generateShadows({ style: "inset" });
			expect(scale.tokens[1]?.value).toContain("inset");
		});

		test("should generate CSS variables", () => {
			const scale = generateShadows({ prefix: "elevation" });
			expect(scale.cssVariables).toContain("--elevation-none");
			expect(scale.cssVariables).toContain("--elevation-sm");
		});

		test("should throw error for invalid config", () => {
			expect(() =>
				generateShadows({ baseOpacity: 2 } as Parameters<
					typeof generateShadows
				>[0]),
			).toThrow(/Invalid shadow config/);
		});

		test("should throw error for invalid color format", () => {
			expect(() =>
				generateShadows({ color: "#GGG" } as Parameters<
					typeof generateShadows
				>[0]),
			).toThrow(/Invalid shadow config/);
		});
	});

	describe("generateShadowTokens", () => {
		test("should generate flat token array", () => {
			const tokens = generateShadowTokens();
			expect(tokens.length).toBe(7);
			expect(tokens[0]?.category).toBe("shadow");
			expect(tokens[0]?.name).toBe("shadow-none");
		});
	});

	describe("SHADOW_PRESETS", () => {
		test("should have material preset", () => {
			const scale = generateShadows(SHADOW_PRESETS.material);
			expect(scale.tokens.length).toBe(7);
		});

		test("should have soft preset", () => {
			const scale = generateShadows(SHADOW_PRESETS.soft);
			expect(scale.tokens.length).toBe(6);
		});

		test("should have brutalist preset", () => {
			const scale = generateShadows(SHADOW_PRESETS.brutalist);
			expect(scale.tokens[1]?.layers.length).toBe(1);
		});

		test("should have neumorphism preset", () => {
			const scale = generateShadows(SHADOW_PRESETS.neumorphism);
			expect(scale.tokens[1]?.value).toContain("inset");
		});
	});
});

describe("Shadow Calculation Precision", () => {
	test("elevation 0 produces no shadow layers", () => {
		const scale = generateShadows();
		const noneShadow = scale.tokens[0];
		expect(noneShadow?.elevation).toBe(0);
		expect(noneShadow?.layers.length).toBe(0);
		expect(noneShadow?.value).toBe("none");
	});

	test("elevation increases exponentially", () => {
		const scale = generateShadows({ levels: 4 });
		const elevations = scale.tokens.map((t) => t.elevation);
		// Should be [0, 3, 5, 7, 10] or similar exponential growth
		expect(elevations[0]).toBe(0);
		expect((elevations[1] ?? 0) < (elevations[2] ?? 0)).toBe(true);
		expect((elevations[2] ?? 0) < (elevations[3] ?? 0)).toBe(true);
		expect((elevations[3] ?? 0) < (elevations[4] ?? 0)).toBe(true);
	});

	test("material shadows have correct layer structure", () => {
		const scale = generateShadows({ style: "material", layered: true });
		const token = scale.tokens[2]; // Get a middle level

		expect(token?.layers.length).toBe(3);

		// Umbra (first) should have negative spread
		const umbra = token?.layers[0];
		expect(umbra?.spread).toBeLessThanOrEqual(0);

		// Penumbra (second) should have 0 spread
		const penumbra = token?.layers[1];
		expect(penumbra?.spread).toBe(0);

		// Ambient (third) should have higher blur
		const ambient = token?.layers[2];
		expect(ambient?.blur).toBeGreaterThan(umbra?.blur ?? 0);
	});

	test("hard shadows have minimal blur", () => {
		const scale = generateShadows({ style: "hard" });
		const token = scale.tokens[2];

		// Hard shadows: blur = elevation * 0.5
		expect(token?.layers[0]?.blur).toBeLessThan(token?.elevation ?? 0);
	});

	test("soft shadows have higher blur ratio", () => {
		const scale = generateShadows({ style: "soft" });
		const token = scale.tokens[2];

		// Soft shadows: blur = elevation * 3
		expect(token?.layers[0]?.blur).toBeGreaterThan(token?.elevation ?? 0);
	});

	test("opacity scales correctly with baseOpacity", () => {
		const lowOpacity = generateShadows({ baseOpacity: 0.1 });
		const highOpacity = generateShadows({ baseOpacity: 0.2 });

		const lowLayer = lowOpacity.tokens[2]?.layers[0];
		const highLayer = highOpacity.tokens[2]?.layers[0];

		expect((highLayer?.opacity ?? 0) > (lowLayer?.opacity ?? 0)).toBe(true);
	});
});

describe("Shadow CSS Output", () => {
	test("CSS value format is correct", () => {
		const scale = generateShadows({ color: "#000000" });
		const token = scale.tokens[1];

		// Should contain rgba format
		expect(token?.value).toMatch(/rgba\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\)/);
		// Should contain px units
		expect(token?.value).toMatch(/\d+px/);
	});

	test("inset shadows include inset keyword", () => {
		const scale = generateShadows({ style: "inset" });
		const token = scale.tokens[1];

		expect(token?.value.startsWith("inset ")).toBe(true);
	});

	test("multi-layer shadows are comma-separated", () => {
		const scale = generateShadows({ style: "material", layered: true });
		const token = scale.tokens[2];

		// 3 layers with rgba() = many commas (3 per rgba + 2 separators)
		const commaCount = (token?.value.match(/,/g) || []).length;
		expect(commaCount).toBeGreaterThan(2); // At least layer separators + rgba commas
	});

	test("CSS variables have correct format", () => {
		const scale = generateShadows({ prefix: "shadow" });

		expect(scale.cssVariables).toContain(":root {");
		expect(scale.cssVariables).toContain("--shadow-none: none;");
		expect(scale.cssVariables).toContain("}");
	});
});

describe("Shadow Token Names", () => {
	test("level names follow convention", () => {
		const scale = generateShadows({ levels: 6 });
		const names = scale.tokens.map((t) => t.name);

		expect(names).toEqual(["none", "xs", "sm", "md", "lg", "xl", "2xl"]);
	});

	test("large level count generates numbered names", () => {
		const scale = generateShadows({ levels: 8 });
		const names = scale.tokens.map((t) => t.name);

		expect(names).toContain("3xl");
		expect(names.length).toBe(9); // none + 8 levels
	});
});
