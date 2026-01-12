import { describe, expect, test } from "bun:test";
import { generateGradient } from "../src/gradients";
import { hexToOklch, interpolateOklch, oklchToHex } from "../src/oklch";

describe("OKLCH Color Space", () => {
	describe("hexToOklch", () => {
		test("converts white correctly", () => {
			const oklch = hexToOklch("#ffffff");
			expect(oklch.l).toBeCloseTo(1, 2);
			expect(oklch.c).toBeCloseTo(0, 2);
		});

		test("converts black correctly", () => {
			const oklch = hexToOklch("#000000");
			expect(oklch.l).toBeCloseTo(0, 2);
			expect(oklch.c).toBeCloseTo(0, 2);
		});

		test("converts pure red correctly", () => {
			const oklch = hexToOklch("#ff0000");
			expect(oklch.l).toBeCloseTo(0.628, 2); // Red has ~0.63 lightness in OKLCH
			expect(oklch.c).toBeGreaterThan(0.2); // Saturated red has high chroma
			expect(oklch.h).toBeCloseTo(29, 0); // Red hue is around 29°
		});

		test("converts pure blue correctly", () => {
			const oklch = hexToOklch("#0000ff");
			expect(oklch.l).toBeCloseTo(0.452, 2); // Blue has ~0.45 lightness
			expect(oklch.c).toBeGreaterThan(0.3); // Blue has very high chroma
			expect(oklch.h).toBeCloseTo(264, 0); // Blue hue is around 264°
		});
	});

	describe("oklchToHex", () => {
		test("converts white correctly", () => {
			const hex = oklchToHex({ l: 1, c: 0, h: 0 });
			expect(hex.toLowerCase()).toBe("#ffffff");
		});

		test("converts black correctly", () => {
			const hex = oklchToHex({ l: 0, c: 0, h: 0 });
			expect(hex.toLowerCase()).toBe("#000000");
		});

		test("roundtrips colors accurately", () => {
			const colors = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6"];

			for (const original of colors) {
				const oklch = hexToOklch(original);
				const roundtripped = oklchToHex(oklch);
				// Allow small rounding differences
				expect(roundtripped.toLowerCase()).toBe(original.toLowerCase());
			}
		});
	});

	describe("interpolateOklch", () => {
		test("returns start color at t=0", () => {
			const start = hexToOklch("#ff0000");
			const end = hexToOklch("#00ff00");
			const result = interpolateOklch(start, end, 0);

			expect(result.l).toBeCloseTo(start.l, 5);
			expect(result.c).toBeCloseTo(start.c, 5);
			expect(result.h).toBeCloseTo(start.h, 5);
		});

		test("returns end color at t=1", () => {
			const start = hexToOklch("#ff0000");
			const end = hexToOklch("#00ff00");
			const result = interpolateOklch(start, end, 1);

			expect(result.l).toBeCloseTo(end.l, 5);
			expect(result.c).toBeCloseTo(end.c, 5);
			expect(result.h).toBeCloseTo(end.h, 5);
		});

		test("returns midpoint at t=0.5", () => {
			const start = hexToOklch("#ff0000");
			const end = hexToOklch("#0000ff");
			const result = interpolateOklch(start, end, 0.5);

			// Midpoint should have average lightness
			const expectedL = (start.l + end.l) / 2;
			expect(result.l).toBeCloseTo(expectedL, 2);
		});

		test("takes shortest hue path", () => {
			// Red (h≈29) to Purple (h≈328) should go backwards through 0
			const red = { l: 0.5, c: 0.2, h: 350 };
			const purple = { l: 0.5, c: 0.2, h: 10 };
			const result = interpolateOklch(red, purple, 0.5);

			// Should be around 0 (or 360), not 180
			expect(result.h).toBeLessThan(30);
		});
	});

	describe("generateGradient", () => {
		test("generates correct number of steps", () => {
			const gradient = generateGradient("#ff0000", "#0000ff", 5);
			expect(gradient).toHaveLength(5);
		});

		test("starts and ends with correct colors", () => {
			const gradient = generateGradient("#ff0000", "#0000ff", 5);
			expect(gradient[0]?.toLowerCase()).toBe("#ff0000");
			expect(gradient[4]?.toLowerCase()).toBe("#0000ff");
		});

		test("produces vibrant midpoints (no muddy zone)", () => {
			// Red to Green in RGB produces muddy brown in the middle
			// OKLCH should produce vibrant yellow/orange
			const gradient = generateGradient("#ff0000", "#00ff00", 5);
			const middle = gradient[2];
			if (!middle) throw new Error("Middle color is undefined");

			const middleOklch = hexToOklch(middle);
			// Middle should have decent chroma (not muddy)
			expect(middleOklch.c).toBeGreaterThan(0.1);
		});
	});
});
