/**
 * Spacing Scale Generation
 *
 * Generates consistent spacing scales using mathematical progressions:
 * - Fibonacci-like (natural, organic)
 * - Linear (consistent)
 * - Exponential (dramatic hierarchy)
 * - T-shirt sizes (semantic naming)
 */

import { z } from "zod";

export type {
	SpacingExportToken,
	SpacingMethod,
	SpacingScale,
	SpacingScaleConfig,
	SpacingToken,
} from "./types/spacing.types";

import type {
	SpacingExportToken,
	SpacingMethod,
	SpacingScale,
	SpacingScaleConfig,
	SpacingToken,
} from "./types/spacing.types";

/**
 * Spacing config validation schema
 */
const SpacingConfigSchema = z.object({
	base: z.number().positive().max(100).optional(),
	method: z.enum(["fibonacci", "linear", "exponential", "t-shirt"]).optional(),
	steps: z.number().int().min(2).max(20).optional(),
	unit: z.enum(["px", "rem", "em"]).optional(),
	prefix: z.string().optional(),
	exponent: z.number().min(1).max(3).optional(),
});

/**
 * T-shirt size names
 */
const TSHIRT_NAMES = [
	"3xs",
	"2xs",
	"xs",
	"sm",
	"md",
	"lg",
	"xl",
	"2xl",
	"3xl",
	"4xl",
	"5xl",
	"6xl",
];

/**
 * Numeric names
 */
const NUMERIC_NAMES = [
	"0",
	"1",
	"2",
	"3",
	"4",
	"5",
	"6",
	"7",
	"8",
	"9",
	"10",
	"11",
	"12",
];

/**
 * Generate Fibonacci-like sequence
 * Modified Fibonacci that starts from base unit
 */
function generateFibonacci(base: number, steps: number): number[] {
	const values: number[] = [0, base / 2]; // 0, 4

	// Start with base multiples then switch to Fibonacci-like
	values.push(base); // 8
	values.push(base * 1.5); // 12
	values.push(base * 2); // 16

	// Fibonacci-like from here
	for (let i = 5; i < steps; i++) {
		const prev1 = values[i - 1] ?? 0;
		const prev2 = values[i - 2] ?? 0;
		const next = prev1 + prev2;
		values.push(Math.round(next));
	}

	return values.slice(0, steps);
}

/**
 * Generate linear progression
 */
function generateLinear(base: number, steps: number): number[] {
	const values: number[] = [];

	for (let i = 0; i < steps; i++) {
		values.push(i * base);
	}

	return values;
}

/**
 * Generate exponential progression
 */
function generateExponential(
	base: number,
	steps: number,
	exponent: number,
): number[] {
	const values: number[] = [0];

	for (let i = 1; i < steps; i++) {
		const value = base * exponent ** (i - 1);
		values.push(Math.round(value));
	}

	return values;
}

/**
 * Generate T-shirt size progression
 * Designed for semantic spacing (compact → comfortable → spacious)
 */
function generateTShirt(base: number, steps: number): number[] {
	// Common T-shirt scale multipliers
	const multipliers = [0, 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 6, 8, 12];

	return multipliers.slice(0, steps).map((m) => Math.round(base * m));
}

/**
 * Format value with unit
 */
function formatValue(px: number, unit: string): string {
	if (unit === "px") return `${px}px`;
	if (unit === "rem")
		return px === 0 ? "0" : `${(px / 16).toFixed(4).replace(/\.?0+$/, "")}rem`;
	if (unit === "em")
		return px === 0 ? "0" : `${(px / 16).toFixed(4).replace(/\.?0+$/, "")}em`;
	return `${px}px`;
}

/**
 * Generates a spacing scale using the specified method.
 *
 * @param config - Configuration options
 * @param config.base - Base unit in pixels (default: 8)
 * @param config.method - Generation method: "fibonacci" | "linear" | "exponential" | "t-shirt"
 * @param config.steps - Number of steps to generate (default: 10)
 * @param config.unit - Output unit: "px" | "rem" | "em" (default: "rem")
 * @param config.prefix - CSS variable prefix (default: "spacing")
 * @param config.exponent - Multiplier for exponential method (default: 1.5)
 * @returns Complete spacing scale with tokens and CSS variables
 * @throws Error if config values are invalid
 *
 * @example
 * ```typescript
 * // Fibonacci (default) - natural progression
 * generateSpacingScale({ base: 8 })
 * // [0, 4, 8, 12, 16, 28, 44, 72, 116, 188]
 *
 * // Linear - consistent increments
 * generateSpacingScale({ base: 8, method: "linear" })
 * // [0, 8, 16, 24, 32, 40, 48, 56, 64, 72]
 *
 * // T-shirt - semantic sizes
 * generateSpacingScale({ base: 8, method: "t-shirt" })
 * // [0, 2, 4, 6, 8, 12, 16, 24, 32, 48]
 * ```
 */
export function generateSpacingScale(
	config: SpacingScaleConfig = {},
): SpacingScale {
	// Validate config
	const parseResult = SpacingConfigSchema.safeParse(config);
	if (!parseResult.success) {
		throw new Error(
			`Invalid spacing config: ${parseResult.error.issues[0]?.message}`,
		);
	}

	const {
		base = 8,
		method = "fibonacci",
		steps = 10,
		unit = "rem",
		prefix = "spacing",
		exponent = 1.5,
	} = config;

	// Generate values based on method
	let values: number[];

	switch (method) {
		case "fibonacci":
			values = generateFibonacci(base, steps);
			break;
		case "linear":
			values = generateLinear(base, steps);
			break;
		case "exponential":
			values = generateExponential(base, steps, exponent);
			break;
		case "t-shirt":
			values = generateTShirt(base, steps);
			break;
		default:
			values = generateFibonacci(base, steps);
	}

	// Create tokens with names
	const names = method === "t-shirt" ? TSHIRT_NAMES : NUMERIC_NAMES;

	const tokens: SpacingToken[] = values.map((value, index) => ({
		name: names[index] || `${index}`,
		value,
		formatted: formatValue(value, unit),
	}));

	// Generate CSS variables
	const cssLines = tokens.map(
		(token) => `  --${prefix}-${token.name}: ${token.formatted};`,
	);
	const cssVariables = `:root {\n${cssLines.join("\n")}\n}`;

	return {
		base,
		method,
		tokens,
		cssVariables,
	};
}

/**
 * Generates spacing tokens for design system export.
 *
 * @param config - Configuration options (same as generateSpacingScale)
 * @returns Array of tokens with name, value, px, and category
 *
 * @example
 * ```typescript
 * generateSpacingTokens({ base: 8, steps: 3 })
 * // [
 * //   { name: "spacing-0", value: "0", px: 0, category: "spacing" },
 * //   { name: "spacing-1", value: "0.25rem", px: 4, category: "spacing" },
 * //   { name: "spacing-2", value: "0.5rem", px: 8, category: "spacing" }
 * // ]
 * ```
 */
export function generateSpacingTokens(
	config: SpacingScaleConfig = {},
): SpacingExportToken[] {
	const scale = generateSpacingScale(config);

	return scale.tokens.map((token) => ({
		name: `spacing-${token.name}`,
		value: token.formatted,
		px: token.value,
		category: "spacing" as const,
	}));
}

/**
 * Common spacing presets
 */
export const SPACING_PRESETS = {
	/** Tailwind-like scale */
	tailwind: {
		base: 4,
		method: "linear" as SpacingMethod,
		steps: 12,
	},
	/** Material Design scale */
	material: {
		base: 8,
		method: "linear" as SpacingMethod,
		steps: 10,
	},
	/** Natural/organic scale */
	natural: {
		base: 8,
		method: "fibonacci" as SpacingMethod,
		steps: 10,
	},
	/** Semantic T-shirt scale */
	semantic: {
		base: 8,
		method: "t-shirt" as SpacingMethod,
		steps: 12,
	},
};
