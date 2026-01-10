import { describe, expect, test } from "bun:test";
import {
	generateSpacingScale,
	generateSpacingTokens,
	SPACING_PRESETS,
} from "../src/spacing";

describe("Spacing Scale Generation", () => {
	describe("generateSpacingScale", () => {
		test("should generate default fibonacci scale", () => {
			const scale = generateSpacingScale();
			expect(scale.method).toBe("fibonacci");
			expect(scale.base).toBe(8);
			expect(scale.tokens.length).toBe(10);
		});

		test("should start with 0", () => {
			const scale = generateSpacingScale();
			expect(scale.tokens[0]?.value).toBe(0);
		});

		test("should generate linear scale", () => {
			const scale = generateSpacingScale({
				method: "linear",
				base: 8,
				steps: 5,
			});
			expect(scale.tokens.map((t) => t.value)).toEqual([0, 8, 16, 24, 32]);
		});

		test("should generate exponential scale", () => {
			const scale = generateSpacingScale({
				method: "exponential",
				base: 4,
				steps: 4,
				exponent: 2,
			});
			expect(scale.tokens[1]?.value).toBe(4);
			expect(scale.tokens[2]?.value).toBe(8);
			expect(scale.tokens[3]?.value).toBe(16);
		});

		test("should generate t-shirt scale with semantic names", () => {
			const scale = generateSpacingScale({ method: "t-shirt", steps: 5 });
			expect(scale.tokens[0]?.name).toBe("3xs");
			expect(scale.tokens[4]?.name).toBe("md");
		});

		test("should format values in rem by default", () => {
			const scale = generateSpacingScale();
			expect(scale.tokens[2]?.formatted).toContain("rem");
		});

		test("should format values in px when specified", () => {
			const scale = generateSpacingScale({ unit: "px" });
			expect(scale.tokens[2]?.formatted).toContain("px");
		});

		test("should generate CSS variables", () => {
			const scale = generateSpacingScale({ prefix: "space" });
			expect(scale.cssVariables).toContain("--space-0");
			expect(scale.cssVariables).toContain("--space-1");
		});

		test("should throw error for invalid config", () => {
			expect(() =>
				generateSpacingScale({ base: -5 } as Parameters<
					typeof generateSpacingScale
				>[0]),
			).toThrow(/Invalid spacing config/);
		});

		test("should throw error for too many steps", () => {
			expect(() =>
				generateSpacingScale({ steps: 50 } as Parameters<
					typeof generateSpacingScale
				>[0]),
			).toThrow(/Invalid spacing config/);
		});
	});

	describe("generateSpacingTokens", () => {
		test("should generate flat token array", () => {
			const tokens = generateSpacingTokens({ steps: 5 });
			expect(tokens.length).toBe(5);
			expect(tokens[0]?.category).toBe("spacing");
			expect(tokens[0]?.name).toBe("spacing-0");
		});

		test("should include px value", () => {
			const tokens = generateSpacingTokens();
			expect(typeof tokens[2]?.px).toBe("number");
		});
	});

	describe("SPACING_PRESETS", () => {
		test("should have tailwind preset", () => {
			const scale = generateSpacingScale(SPACING_PRESETS.tailwind);
			expect(scale.base).toBe(4);
			expect(scale.method).toBe("linear");
		});

		test("should have material preset", () => {
			const scale = generateSpacingScale(SPACING_PRESETS.material);
			expect(scale.base).toBe(8);
		});

		test("should have natural preset", () => {
			const scale = generateSpacingScale(SPACING_PRESETS.natural);
			expect(scale.method).toBe("fibonacci");
		});

		test("should have semantic preset", () => {
			const scale = generateSpacingScale(SPACING_PRESETS.semantic);
			expect(scale.method).toBe("t-shirt");
		});
	});
});

describe("Spacing Fibonacci Sequence", () => {
	test("generates correct fibonacci-like values", () => {
		const scale = generateSpacingScale({
			base: 8,
			method: "fibonacci",
			steps: 8,
		});

		const values = scale.tokens.map((t) => t.value);

		// First values follow modified fibonacci: 0, 4, 8, 12, 16, then fib
		expect(values[0]).toBe(0);
		expect(values[1]).toBe(4); // base / 2
		expect(values[2]).toBe(8); // base
		expect(values[3]).toBe(12); // base * 1.5
		expect(values[4]).toBe(16); // base * 2
		// After that, fibonacci-like: values[n] ≈ values[n-1] + values[n-2]
	});

	test("values are integers (no decimals)", () => {
		const scale = generateSpacingScale({
			base: 8,
			method: "fibonacci",
			steps: 10,
		});

		for (const token of scale.tokens) {
			expect(Number.isInteger(token.value)).toBe(true);
		}
	});
});

describe("Spacing Linear Sequence", () => {
	test("generates evenly spaced values", () => {
		const scale = generateSpacingScale({
			base: 8,
			method: "linear",
			steps: 5,
		});

		const values = scale.tokens.map((t) => t.value);
		expect(values).toEqual([0, 8, 16, 24, 32]);
	});

	test("respects custom base", () => {
		const scale = generateSpacingScale({
			base: 4,
			method: "linear",
			steps: 4,
		});

		const values = scale.tokens.map((t) => t.value);
		expect(values).toEqual([0, 4, 8, 12]);
	});
});

describe("Spacing Exponential Sequence", () => {
	test("generates exponentially growing values", () => {
		const scale = generateSpacingScale({
			base: 4,
			method: "exponential",
			exponent: 2,
			steps: 5,
		});

		const values = scale.tokens.map((t) => t.value);
		expect(values[0]).toBe(0);
		expect(values[1]).toBe(4); // 4 * 2^0
		expect(values[2]).toBe(8); // 4 * 2^1
		expect(values[3]).toBe(16); // 4 * 2^2
		expect(values[4]).toBe(32); // 4 * 2^3
	});
});

describe("Spacing T-Shirt Sizes", () => {
	test("uses semantic names", () => {
		const scale = generateSpacingScale({
			base: 8,
			method: "t-shirt",
			steps: 8,
		});

		const names = scale.tokens.map((t) => t.name);
		expect(names).toContain("xs");
		expect(names).toContain("sm");
		expect(names).toContain("md");
		expect(names).toContain("lg");
		expect(names).toContain("xl");
	});

	test("has predefined multipliers", () => {
		const scale = generateSpacingScale({
			base: 8,
			method: "t-shirt",
			steps: 5,
		});

		const values = scale.tokens.map((t) => t.value);
		// Multipliers: 0, 0.25, 0.5, 0.75, 1
		expect(values).toEqual([0, 2, 4, 6, 8]);
	});
});

describe("Spacing CSS Output", () => {
	test("formats rem correctly", () => {
		const scale = generateSpacingScale({
			base: 16,
			method: "linear",
			steps: 3,
			unit: "rem",
		});

		expect(scale.tokens[0]?.formatted).toBe("0");
		expect(scale.tokens[1]?.formatted).toBe("1rem");
		expect(scale.tokens[2]?.formatted).toBe("2rem");
	});

	test("formats em correctly", () => {
		const scale = generateSpacingScale({
			base: 16,
			method: "linear",
			steps: 2,
			unit: "em",
		});

		expect(scale.tokens[1]?.formatted).toBe("1em");
	});

	test("formats px correctly", () => {
		const scale = generateSpacingScale({
			base: 8,
			method: "linear",
			steps: 2,
			unit: "px",
		});

		expect(scale.tokens[1]?.formatted).toBe("8px");
	});

	test("CSS variables have correct format", () => {
		const scale = generateSpacingScale({ prefix: "space" });

		expect(scale.cssVariables).toContain(":root {");
		expect(scale.cssVariables).toContain("--space-0:");
		expect(scale.cssVariables).toContain("}");
	});
});

describe("Spacing Token Export", () => {
	test("tokens have correct category", () => {
		const tokens = generateSpacingTokens();

		for (const token of tokens) {
			expect(token.category).toBe("spacing");
		}
	});

	test("token names include prefix", () => {
		const tokens = generateSpacingTokens();

		for (const token of tokens) {
			expect(token.name.startsWith("spacing-")).toBe(true);
		}
	});

	test("px value matches computed value", () => {
		const tokens = generateSpacingTokens({
			base: 8,
			method: "linear",
			steps: 3,
		});

		expect(tokens[0]?.px).toBe(0);
		expect(tokens[1]?.px).toBe(8);
		expect(tokens[2]?.px).toBe(16);
	});
});
