import { describe, expect, test } from "bun:test";
import {
	generateTypographyScale,
	generateTypographyTokens,
	TYPOGRAPHY_RATIOS,
} from "../src/typography";

describe("Typography Scale Generation", () => {
	describe("generateTypographyScale", () => {
		test("should generate default scale with perfect-fourth ratio", () => {
			const scale = generateTypographyScale();
			expect(Math.abs(scale.ratio - 1.333)).toBeLessThan(0.01);
			expect(scale.ratioName).toBe("perfect-fourth");
			expect(scale.base).toBe(16);
		});

		test("should generate correct number of tokens", () => {
			const scale = generateTypographyScale({ stepsUp: 4, stepsDown: 2 });
			// 2 down + base + 4 up = 7 tokens
			expect(scale.tokens.length).toBe(7);
		});

		test("should include base size", () => {
			const scale = generateTypographyScale({ base: 16 });
			const baseToken = scale.tokens.find((t) => t.name === "base");
			expect(baseToken?.fontSize).toBe(16);
		});

		test("should scale up correctly", () => {
			const scale = generateTypographyScale({
				base: 16,
				ratio: "major-third", // 1.25
				stepsUp: 2,
				stepsDown: 0,
			});
			expect(Math.abs((scale.tokens[1]?.fontSize ?? 0) - 20)).toBeLessThan(1); // 16 * 1.25
			expect(Math.abs((scale.tokens[2]?.fontSize ?? 0) - 25)).toBeLessThan(1); // 16 * 1.25^2
		});

		test("should accept custom numeric ratio", () => {
			const scale = generateTypographyScale({ ratio: 1.5 });
			expect(scale.ratio).toBe(1.5);
			expect(scale.ratioName).toBeUndefined();
		});

		test("should calculate line height based on size", () => {
			const scale = generateTypographyScale({
				base: 16,
				stepsUp: 6,
				stepsDown: 2,
				baseLineHeight: 1.5,
			});
			// Small text should have looser line height
			const smallToken = scale.tokens[0];
			expect(smallToken?.lineHeight).toBeGreaterThanOrEqual(1.5);
			// Large text should have tighter line height
			const largeToken = scale.tokens[scale.tokens.length - 1];
			expect(largeToken?.lineHeight).toBeLessThan(1.5);
		});

		test("should calculate letter spacing based on size", () => {
			const scale = generateTypographyScale({
				base: 16,
				stepsUp: 6,
				stepsDown: 2,
			});
			// Small text should have positive tracking
			const smallToken = scale.tokens[0];
			expect(smallToken?.letterSpacing).toBeGreaterThan(0);
			// Large text should have negative tracking
			const largeToken = scale.tokens[scale.tokens.length - 1];
			expect(largeToken?.letterSpacing).toBeLessThan(0);
		});

		test("should suggest font weights", () => {
			const scale = generateTypographyScale({ stepsUp: 6, stepsDown: 2 });
			// Small text should have weight 400
			const smallToken = scale.tokens[0]; // xs - smallest
			expect(smallToken?.weight).toBe(400);
			// Display text should be bolder
			const displayToken = scale.tokens[scale.tokens.length - 1];
			expect(displayToken?.weight).toBeGreaterThan(400);
		});

		test("should generate CSS variables", () => {
			const scale = generateTypographyScale({ prefix: "text" });
			expect(scale.cssVariables).toContain("--text-base");
			expect(scale.cssVariables).toContain("--line-height-base");
		});

		test("should format in px when specified", () => {
			const scale = generateTypographyScale({ unit: "px" });
			expect(scale.cssVariables).toContain("16px");
		});

		test("should throw error for invalid config", () => {
			expect(() =>
				generateTypographyScale({ base: 4 } as Parameters<
					typeof generateTypographyScale
				>[0]),
			).toThrow(/Invalid typography config/);
		});

		test("should throw error for invalid ratio", () => {
			expect(() =>
				generateTypographyScale({ ratio: 0.5 } as Parameters<
					typeof generateTypographyScale
				>[0]),
			).toThrow(/Invalid typography config/);
		});
	});

	describe("generateTypographyTokens", () => {
		test("should generate flat token array", () => {
			const tokens = generateTypographyTokens({ stepsUp: 2, stepsDown: 1 });
			expect(tokens.length).toBe(4);
			expect(tokens[0]?.category).toBe("typography");
		});

		test("should format letter spacing as em or normal", () => {
			const tokens = generateTypographyTokens();
			const normalToken = tokens.find((t) => t.letterSpacing === "normal");
			expect(normalToken).toBeDefined();
		});
	});

	describe("TYPOGRAPHY_RATIOS", () => {
		test("should have all common ratios", () => {
			expect(Math.abs(TYPOGRAPHY_RATIOS["minor-second"] - 1.067)).toBeLessThan(
				0.01,
			);
			expect(Math.abs(TYPOGRAPHY_RATIOS["major-second"] - 1.125)).toBeLessThan(
				0.01,
			);
			expect(Math.abs(TYPOGRAPHY_RATIOS["minor-third"] - 1.2)).toBeLessThan(
				0.01,
			);
			expect(Math.abs(TYPOGRAPHY_RATIOS["major-third"] - 1.25)).toBeLessThan(
				0.01,
			);
			expect(
				Math.abs(TYPOGRAPHY_RATIOS["perfect-fourth"] - 1.333),
			).toBeLessThan(0.01);
			expect(
				Math.abs(TYPOGRAPHY_RATIOS["augmented-fourth"] - Math.SQRT2),
			).toBeLessThan(0.01);
			expect(Math.abs(TYPOGRAPHY_RATIOS["perfect-fifth"] - 1.5)).toBeLessThan(
				0.01,
			);
			expect(Math.abs(TYPOGRAPHY_RATIOS["golden-ratio"] - 1.618)).toBeLessThan(
				0.01,
			);
		});
	});
});

describe("Typography Scale Math", () => {
	test("golden-ratio produces exact 1.618", () => {
		expect(TYPOGRAPHY_RATIOS["golden-ratio"]).toBeCloseTo(1.618, 3);
	});

	test("scale down produces values < base", () => {
		const scale = generateTypographyScale({
			base: 16,
			stepsDown: 2,
			stepsUp: 1,
		});

		const smallestToken = scale.tokens[0];
		expect(smallestToken?.fontSize).toBeLessThan(16);
	});

	test("0 stepsDown means first token is base size", () => {
		const scale = generateTypographyScale({
			base: 16,
			stepsDown: 0,
			stepsUp: 2,
		});

		// With 0 stepsDown, the scale starts at base
		const firstToken = scale.tokens[0];
		expect(firstToken?.fontSize).toBe(16);
	});

	test("large stepsUp generates fallback names", () => {
		const scale = generateTypographyScale({
			base: 16,
			stepsDown: 0,
			stepsUp: 10, // Max allowed
		});

		const lastToken = scale.tokens[scale.tokens.length - 1];
		// Should use numbered names for sizes beyond the preset names
		expect(lastToken?.name).toBeDefined();
	});

	test("font sizes scale correctly with ratio", () => {
		const scale = generateTypographyScale({
			base: 16,
			ratio: 2, // Double each step
			stepsUp: 3,
			stepsDown: 0,
		});

		const sizes = scale.tokens.map((t) => t.fontSize);
		expect(sizes[0]).toBe(16); // base
		expect(sizes[1]).toBe(32); // 16 * 2
		expect(sizes[2]).toBe(64); // 16 * 4
		expect(sizes[3]).toBe(128); // 16 * 8
	});

	test("scale down divides by ratio", () => {
		const scale = generateTypographyScale({
			base: 16,
			ratio: 2,
			stepsDown: 2,
			stepsUp: 1, // Minimum required
		});

		const sizes = scale.tokens.map((t) => t.fontSize);
		expect(sizes[0]).toBe(4); // 16 / 4
		expect(sizes[1]).toBe(8); // 16 / 2
		expect(sizes[2]).toBe(16); // base
	});
});

describe("Typography Line Height Calculation", () => {
	test("small text has looser line height than base", () => {
		const scale = generateTypographyScale({
			base: 16,
			stepsDown: 2,
			stepsUp: 2,
			baseLineHeight: 1.5,
		});

		const smallToken = scale.tokens[0]; // Smallest size
		const baseToken = scale.tokens.find((t) => t.fontSize === 16);
		// Small text should have equal or greater line height
		expect(smallToken?.lineHeight).toBeGreaterThanOrEqual(
			baseToken?.lineHeight ?? 0,
		);
	});

	test("large text has tighter line height", () => {
		const scale = generateTypographyScale({
			base: 16,
			stepsDown: 0,
			stepsUp: 6,
			baseLineHeight: 1.5,
		});

		const largeToken = scale.tokens[scale.tokens.length - 1];
		expect(largeToken?.lineHeight).toBeLessThan(1.5);
	});

	test("line height varies based on font size", () => {
		const scale = generateTypographyScale({
			base: 16,
			stepsDown: 2,
			stepsUp: 4,
			baseLineHeight: 1.5,
		});

		// Small, medium, large tokens should have different line heights
		const small = scale.tokens[0];
		const large = scale.tokens[scale.tokens.length - 1];
		expect(small?.lineHeight).not.toBe(large?.lineHeight);
	});
});

describe("Typography Letter Spacing", () => {
	test("very small text has positive tracking", () => {
		const scale = generateTypographyScale({
			base: 16,
			stepsDown: 3, // Go smaller to trigger positive tracking
			stepsUp: 1,
		});

		const smallestToken = scale.tokens[0];
		// Size ratio <= 0.75 should have positive tracking
		expect(smallestToken?.letterSpacing).toBeGreaterThan(0);
	});

	test("display text has negative tracking", () => {
		const scale = generateTypographyScale({
			base: 16,
			stepsDown: 0,
			stepsUp: 6,
		});

		const displayToken = scale.tokens[scale.tokens.length - 1];
		expect(displayToken?.letterSpacing).toBeLessThan(0);
	});

	test("letter spacing varies across scale", () => {
		const scale = generateTypographyScale({
			base: 16,
			stepsDown: 2,
			stepsUp: 4,
		});

		// Verify letter spacing values exist and are numbers
		for (const token of scale.tokens) {
			expect(typeof token.letterSpacing).toBe("number");
		}
	});
});

describe("Typography Font Weight Suggestions", () => {
	test("display text suggests bold weight", () => {
		const scale = generateTypographyScale({
			base: 16,
			stepsDown: 0,
			stepsUp: 6,
		});

		const displayToken = scale.tokens[scale.tokens.length - 1];
		expect(displayToken?.weight).toBeGreaterThanOrEqual(600);
	});

	test("weights increase with font size", () => {
		const scale = generateTypographyScale({
			base: 16,
			stepsDown: 2,
			stepsUp: 6,
		});

		const smallest = scale.tokens[0];
		const largest = scale.tokens[scale.tokens.length - 1];

		// Larger text should have equal or higher weight
		expect(largest?.weight ?? 0).toBeGreaterThanOrEqual(smallest?.weight ?? 0);
	});
});
