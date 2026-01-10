import { describe, expect, test } from "bun:test";
import { generatePalette, generatePaletteTokens } from "../src/palette";

describe("Palette Generation", () => {
	test("should generate 10 shades from a base color", () => {
		const palette = generatePalette("#3B82F6");

		expect(palette.shades[50]).toBeDefined();
		expect(palette.shades[100]).toBeDefined();
		expect(palette.shades[500]).toBeDefined();
		expect(palette.shades[900]).toBeDefined();
	});

	test("should preserve base color at shade 500", () => {
		const baseColor = "#3B82F6";
		const palette = generatePalette(baseColor);

		expect(palette.shades[500].value).toBe(baseColor);
		expect(palette.base).toBe(baseColor);
	});

	test("should generate lighter shades for 50-400", () => {
		const palette = generatePalette("#3B82F6");

		// Light shades should have high lightness
		// They should be different from the base
		expect(palette.shades[50].value).not.toBe(palette.shades[500].value);
		expect(palette.shades[100].value).not.toBe(palette.shades[500].value);
	});

	test("should generate darker shades for 600-900", () => {
		const palette = generatePalette("#3B82F6");

		// Dark shades should be different from base
		expect(palette.shades[900].value).not.toBe(palette.shades[500].value);
		expect(palette.shades[800].value).not.toBe(palette.shades[500].value);
	});

	test("should calculate text color for each shade", () => {
		const palette = generatePalette("#3B82F6");

		// Light shades should have black text
		expect(palette.shades[50].textColor).toBe("#000000");
		expect(palette.shades[100].textColor).toBe("#000000");

		// Dark shades should have white text
		expect(palette.shades[800].textColor).toBe("#ffffff");
		expect(palette.shades[900].textColor).toBe("#ffffff");
	});

	test("should include contrast ratio for each shade", () => {
		const palette = generatePalette("#3B82F6");

		expect(palette.shades[500].contrastRatio).toBeGreaterThan(1);
		expect(palette.shades[100].contrastRatio).toBeGreaterThan(1);
	});

	test("should work with different base colors", () => {
		const redPalette = generatePalette("#EF4444");
		const greenPalette = generatePalette("#22C55E");
		const yellowPalette = generatePalette("#EAB308");

		expect(redPalette.shades[500].value).toBe("#EF4444");
		expect(greenPalette.shades[500].value).toBe("#22C55E");
		expect(yellowPalette.shades[500].value).toBe("#EAB308");
	});

	test("should set optional name", () => {
		const palette = generatePalette("#3B82F6", "primary");

		expect(palette.name).toBe("primary");
	});
});

describe("Palette Tokens", () => {
	test("should generate flat token array", () => {
		const tokens = generatePaletteTokens("#3B82F6", "primary");

		expect(tokens.length).toBe(10);
		expect(tokens[0]?.name).toBe("primary-50");
		expect(tokens[4]?.name).toBe("primary-400");
		expect(tokens[9]?.name).toBe("primary-900");
	});

	test("should include all required properties", () => {
		const tokens = generatePaletteTokens("#3B82F6", "primary");

		for (const token of tokens) {
			expect(token.name).toBeDefined();
			expect(token.value).toMatch(/^#[A-Fa-f0-9]{6}$/);
			expect(token.textColor).toMatch(/^#[A-Fa-f0-9]{6}$/);
			expect(token.contrastRatio).toBeGreaterThan(0);
		}
	});
});

describe("Palette Edge Cases", () => {
	test("grayscale base color produces valid palette", () => {
		const palette = generatePalette("#808080");

		expect(palette.shades[50]).toBeDefined();
		expect(palette.shades[500]).toBeDefined();
		expect(palette.shades[900]).toBeDefined();
		// All shades should be grayscale-ish
		expect(palette.shades[500].value).toBe("#808080");
	});

	test("fully saturated red produces valid palette", () => {
		const palette = generatePalette("#FF0000");

		expect(palette.shades[500].value).toBe("#FF0000");
		// Light shades should be pinkish
		expect(palette.shades[50]).toBeDefined();
		// Dark shades should be dark red
		expect(palette.shades[900]).toBeDefined();
	});

	test("very dark base color works", () => {
		const palette = generatePalette("#0A0A0A");

		expect(palette.shades[500].value).toBe("#0A0A0A");
		// Text on dark should be white
		expect(palette.shades[500].textColor).toBe("#ffffff");
	});

	test("very light base color works", () => {
		const palette = generatePalette("#FAFAFA");

		expect(palette.shades[500].value).toBe("#FAFAFA");
		// Text on light should be black
		expect(palette.shades[500].textColor).toBe("#000000");
	});

	test("shorthand hex input works", () => {
		const palette = generatePalette("#F00");

		// Base is preserved as-is (user's original input)
		expect(palette.base).toBe("#F00");
		// Other shades are generated correctly (full hex)
		expect(palette.shades[50]).toBeDefined();
		expect(palette.shades[900]).toBeDefined();
	});

	test("lowercase hex input works", () => {
		const palette = generatePalette("#3b82f6");

		expect(palette.shades[500].value).toBe("#3b82f6");
	});

	test("throws for invalid hex", () => {
		expect(() => generatePalette("#GGG")).toThrow();
		expect(() => generatePalette("invalid")).toThrow();
		expect(() => generatePalette("")).toThrow();
	});

	test("contrast ratios are reasonable for all shades", () => {
		const palette = generatePalette("#3B82F6");

		for (const [, shade] of Object.entries(palette.shades)) {
			// Text/background contrast should be at least 1 (same color)
			expect(shade.contrastRatio).toBeGreaterThanOrEqual(1);
			// And less than 21 (max possible)
			expect(shade.contrastRatio).toBeLessThanOrEqual(21);
		}
	});

	test("shade order is consistent (light to dark)", () => {
		const palette = generatePalette("#3B82F6");

		// 50 should be lightest, 900 should be darkest
		// We can't compare hex values directly, but we can check text colors
		// Light shades should have black text, dark shades white text
		expect(palette.shades[50].textColor).toBe("#000000");
		expect(palette.shades[900].textColor).toBe("#ffffff");
	});
});

describe("Palette Token Generation", () => {
	test("tokens are sorted by shade number", () => {
		const tokens = generatePaletteTokens("#3B82F6", "primary");

		const shadeNumbers = tokens.map((t) =>
			Number.parseInt(t.name.split("-")[1] ?? "0", 10),
		);
		expect(shadeNumbers).toEqual([
			50, 100, 200, 300, 400, 500, 600, 700, 800, 900,
		]);
	});

	test("token names use provided prefix", () => {
		const tokens = generatePaletteTokens("#3B82F6", "brand");

		for (const token of tokens) {
			expect(token.name.startsWith("brand-")).toBe(true);
		}
	});
});
