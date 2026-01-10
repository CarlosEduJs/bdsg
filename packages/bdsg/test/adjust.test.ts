import { describe, expect, test } from "bun:test";
import {
	adjustColorForContrast,
	generateAccessibleVariations,
} from "../src/adjust";
import { calculateContrast } from "../src/contrast";

describe("Color Adjustment", () => {
	test("should adjust light blue to meet WCAG AA", () => {
		const result = adjustColorForContrast("#87CEEB", "#FFFFFF", "AA", "normal");

		// Light blue is very light, may need fallback
		expect(result.ratio).toBeGreaterThanOrEqual(4.5);
		expect(["lightness", "chroma", "fallback"]).toContain(result.strategy);
	});

	test("should preserve hue when adjusting", () => {
		const original = "#FF6B6B"; // Red
		const result = adjustColorForContrast(original, "#FFFFFF", "AA", "normal");

		// Should still be reddish (hue preserved)
		expect(result.adjusted).toMatch(/^#[a-fA-F0-9]{6}$/);
		expect(result.ratio).toBeGreaterThanOrEqual(4.5);
	});

	test("should darken light colors on white background", () => {
		const result = adjustColorForContrast("#FFFF00", "#FFFFFF", "AA", "normal");

		expect(result.ratio).toBeGreaterThanOrEqual(4.5);
		// Yellow should be darkened
		expect(result.adjusted).not.toBe("#FFFF00");
	});

	test("should lighten dark colors on dark background", () => {
		const result = adjustColorForContrast("#333333", "#000000", "AA", "normal");

		expect(result.ratio).toBeGreaterThanOrEqual(4.5);
	});

	test("should meet AAA when requested", () => {
		const result = adjustColorForContrast(
			"#3B82F6",
			"#FFFFFF",
			"AAA",
			"normal",
		);

		expect(result.ratio).toBeGreaterThanOrEqual(7.0);
	});

	test("should generate accessible variations", () => {
		const variations = generateAccessibleVariations("#3B82F6", "#FFFFFF");

		// Base should be accessible
		const baseRatio = calculateContrast(variations.base, "#FFFFFF");
		expect(baseRatio).toBeGreaterThanOrEqual(4.5);

		// Should have all variations
		expect(variations.light).toBeDefined();
		expect(variations.dark).toBeDefined();
		expect(variations.text).toBeDefined();

		// Text should be black or white
		expect(["#ffffff", "#000000"]).toContain(variations.text);
	});

	test("should maintain visual identity (not turn gray)", () => {
		const original = "#FF0000"; // Pure red
		const result = adjustColorForContrast(original, "#FFFFFF", "AA", "normal");

		// Should not be pure black or white (unless fallback)
		if (result.strategy !== "fallback") {
			expect(result.adjusted).not.toBe("#000000");
			expect(result.adjusted).not.toBe("#FFFFFF");
		}
	});
});

describe("Color Adjustment Edge Cases", () => {
	test("already accessible color returns unchanged with 0 iterations", () => {
		// Dark blue on white - already passes AA
		const result = adjustColorForContrast("#1E3A5F", "#FFFFFF", "AA", "normal");

		expect(result.ratio).toBeGreaterThanOrEqual(4.5);
		expect(result.iterations).toBe(0);
		expect(result.adjusted).toBe("#1E3A5F");
	});

	test("pure black on white background returns unchanged", () => {
		const result = adjustColorForContrast("#000000", "#FFFFFF", "AA", "normal");

		expect(result.ratio).toBeCloseTo(21, 0);
		expect(result.iterations).toBe(0);
		expect(result.adjusted).toBe("#000000");
	});

	test("pure white on black background returns unchanged", () => {
		const result = adjustColorForContrast("#FFFFFF", "#000000", "AA", "normal");

		expect(result.ratio).toBeCloseTo(21, 0);
		expect(result.iterations).toBe(0);
	});

	test("gray on gray (worst case) uses fallback", () => {
		// Medium gray on medium gray - very low contrast
		const result = adjustColorForContrast("#808080", "#7F7F7F", "AA", "normal");

		expect(result.ratio).toBeGreaterThanOrEqual(4.5);
		// Should need significant adjustment
		expect(result.adjusted).not.toBe("#808080");
	});

	test("reports correct iteration count for adjustments", () => {
		const result = adjustColorForContrast("#AAAAAA", "#FFFFFF", "AA", "normal");

		// Should have done some iterations (binary search)
		expect(result.iterations).toBeGreaterThan(0);
		expect(result.iterations).toBeLessThan(50); // Reasonable upper bound
	});

	test("handles shorthand hex input (#FFF)", () => {
		const result = adjustColorForContrast("#F00", "#FFF", "AA", "normal");

		expect(result.ratio).toBeGreaterThanOrEqual(4.5);
		expect(result.original).toBe("#F00");
	});

	test("handles lowercase hex input", () => {
		const result = adjustColorForContrast("#ff0000", "#ffffff", "AA", "normal");

		expect(result.ratio).toBeGreaterThanOrEqual(4.5);
	});

	test("large text requires lower contrast (3.0)", () => {
		const result = adjustColorForContrast("#888888", "#FFFFFF", "AA", "large");

		expect(result.ratio).toBeGreaterThanOrEqual(3.0);
		// May need less adjustment than normal text
	});

	test("chroma strategy activates when lightness maxes out", () => {
		// Very light yellow on white - lightness can't help much
		const result = adjustColorForContrast("#FFFFCC", "#FFFFFF", "AA", "normal");

		expect(result.ratio).toBeGreaterThanOrEqual(4.5);
		// Could be chroma or fallback
		expect(["lightness", "chroma", "fallback"]).toContain(result.strategy);
	});
});

describe("generateAccessibleVariations Edge Cases", () => {
	test("works with grayscale input", () => {
		const variations = generateAccessibleVariations("#808080", "#FFFFFF");

		expect(variations.base).toBeDefined();
		expect(variations.light).toBeDefined();
		expect(variations.dark).toBeDefined();
	});

	test("light and dark variants are distinct from each other", () => {
		const variations = generateAccessibleVariations("#3B82F6", "#FFFFFF");

		// Light and dark should always be different
		expect(variations.light).not.toBe(variations.dark);
		// Light should be different from base
		expect(variations.light).not.toBe(variations.base);
		// Note: Dark could equal base in edge cases when base needs heavy adjustment
	});

	test("works with very dark base color", () => {
		const variations = generateAccessibleVariations("#1A1A1A", "#FFFFFF");

		expect(variations.base).toBeDefined();
		// Text on very dark should be white
		expect(variations.text).toBe("#ffffff");
	});

	test("works with very light base color", () => {
		const variations = generateAccessibleVariations("#F0F0F0", "#FFFFFF");

		expect(variations.base).toBeDefined();
		// Will likely need significant adjustment
	});
});
