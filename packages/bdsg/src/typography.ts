/**
 * Typography Scale Generation
 *
 * Generates a harmonious typography scale based on musical ratios
 * and modular scale theory.
 */

import { z } from "zod";

/**
 * Common typographic ratios based on musical intervals
 */
export const TYPOGRAPHY_RATIOS = {
	"minor-second": 1.067,
	"major-second": 1.125,
	"minor-third": 1.2,
	"major-third": 1.25,
	"perfect-fourth": 1.333,
	"augmented-fourth": Math.SQRT2,
	"perfect-fifth": 1.5,
	"golden-ratio": 1.618,
} as const;

export type TypographyRatio = keyof typeof TYPOGRAPHY_RATIOS;

/**
 * Typography token with all properties
 */
export interface TypographyToken {
	name: string;
	fontSize: number;
	lineHeight: number;
	letterSpacing: number;
	/** Recommended font weight */
	weight?: number;
}

/**
 * Typography scale configuration
 */
export interface TypographyScaleConfig {
	/** Base font size in pixels (default: 16) */
	base?: number;
	/** Scale ratio (default: "perfect-fourth") */
	ratio?: TypographyRatio | number;
	/** Number of steps up from base (default: 6) */
	stepsUp?: number;
	/** Number of steps down from base (default: 2) */
	stepsDown?: number;
	/** Base line height ratio (default: 1.5) */
	baseLineHeight?: number;
	/** Unit for output (default: "rem") */
	unit?: "px" | "rem" | "em";
	/** Token name prefix (default: "font-size") */
	prefix?: string;
}

/**
 * Complete typography scale
 */
export interface TypographyScale {
	base: number;
	ratio: number;
	ratioName?: string;
	tokens: TypographyToken[];
	cssVariables: string;
}

/**
 * Typography config validation schema
 */
const TypographyConfigSchema = z.object({
	base: z.number().min(8).max(32).optional(),
	ratio: z
		.union([
			z.enum([
				"minor-second",
				"major-second",
				"minor-third",
				"major-third",
				"perfect-fourth",
				"augmented-fourth",
				"perfect-fifth",
				"golden-ratio",
			]),
			z.number().min(1.01).max(2.5),
		])
		.optional(),
	stepsUp: z.number().int().min(1).max(10).optional(),
	stepsDown: z.number().int().min(0).max(4).optional(),
	baseLineHeight: z.number().min(1).max(2).optional(),
	unit: z.enum(["px", "rem", "em"]).optional(),
	prefix: z.string().optional(),
});

/**
 * Common scale names
 */
const SCALE_NAMES = [
	"xs",
	"sm",
	"base",
	"md",
	"lg",
	"xl",
	"2xl",
	"3xl",
	"4xl",
	"5xl",
];

/**
 * Calculate optimal line height based on font size
 * Larger text needs tighter line height
 */
function calculateLineHeight(
	fontSize: number,
	baseFontSize: number,
	baseLineHeight: number,
): number {
	const ratio = fontSize / baseFontSize;

	if (ratio <= 0.75) {
		// Small text - loose line height
		return Math.min(baseLineHeight + 0.2, 2.0);
	}
	if (ratio >= 2.5) {
		// Display text - tight line height
		return Math.max(baseLineHeight - 0.3, 1.1);
	}
	if (ratio >= 1.5) {
		// Heading - slightly tighter
		return baseLineHeight - 0.1 * (ratio - 1);
	}

	return baseLineHeight;
}

/**
 * Calculate letter spacing based on font size
 * Source: Design typography best practices
 */
function calculateLetterSpacing(
	fontSize: number,
	baseFontSize: number,
): number {
	const ratio = fontSize / baseFontSize;

	if (ratio <= 0.75) {
		// Small text - positive tracking
		return 0.025;
	}
	if (ratio >= 2.0) {
		// Display text - negative tracking
		return -0.02;
	}
	if (ratio >= 1.5) {
		// Heading - slightly tight
		return -0.01;
	}

	return 0;
}

/**
 * Suggest font weight based on size
 */
function suggestWeight(fontSize: number, baseFontSize: number): number {
	const ratio = fontSize / baseFontSize;

	if (ratio >= 2.5) return 700; // Display - bold
	if (ratio >= 1.75) return 600; // Large heading - semibold
	if (ratio >= 1.25) return 500; // Heading - medium
	if (ratio <= 0.75) return 400; // Small - normal

	return 400; // Body - normal
}

/**
 * Generates a typography scale using musical ratios.
 *
 * @param config - Configuration options
 * @param config.base - Base font size in pixels (default: 16)
 * @param config.ratio - Scale ratio (name or number, default: "perfect-fourth")
 * @param config.stepsUp - Steps above base (default: 6)
 * @param config.stepsDown - Steps below base (default: 2)
 * @param config.baseLineHeight - Line height for base size (default: 1.5)
 * @param config.unit - Output unit (default: "rem")
 * @param config.prefix - CSS variable prefix (default: "font-size")
 * @returns Complete typography scale with tokens and CSS variables
 * @throws Error if config values are invalid
 *
 * @example
 * ```typescript
 * const scale = generateTypographyScale({
 *   base: 16,
 *   ratio: "perfect-fourth",
 *   stepsUp: 6,
 *   stepsDown: 2
 * });
 * // scale.tokens = [
 * //   { name: "xs", fontSize: 9, lineHeight: 1.7, ... },
 * //   { name: "sm", fontSize: 12, lineHeight: 1.6, ... },
 * //   { name: "base", fontSize: 16, lineHeight: 1.5, ... },
 * //   { name: "md", fontSize: 21, lineHeight: 1.4, ... },
 * //   ...
 * // ]
 * ```
 */
export function generateTypographyScale(
	config: TypographyScaleConfig = {},
): TypographyScale {
	// Validate config
	const parseResult = TypographyConfigSchema.safeParse(config);
	if (!parseResult.success) {
		throw new Error(
			`Invalid typography config: ${parseResult.error.issues[0]?.message}`,
		);
	}

	const {
		base = 16,
		ratio = "perfect-fourth",
		stepsUp = 6,
		stepsDown = 2,
		baseLineHeight = 1.5,
		unit = "rem",
		prefix = "font-size",
	} = config;

	// Resolve ratio
	const numericRatio =
		typeof ratio === "number" ? ratio : TYPOGRAPHY_RATIOS[ratio];
	const ratioName = typeof ratio === "string" ? ratio : undefined;

	const tokens: TypographyToken[] = [];

	for (let i = -stepsDown; i <= stepsUp; i++) {
		const fontSize = Math.round(base * numericRatio ** i * 100) / 100;
		const lineHeight =
			Math.round(calculateLineHeight(fontSize, base, baseLineHeight) * 100) /
			100;
		const letterSpacing =
			Math.round(calculateLetterSpacing(fontSize, base) * 1000) / 1000;
		const weight = suggestWeight(fontSize, base);

		// Name: use common scale names, or generate numbered ones
		const nameIndex = i + stepsDown;
		const name =
			(nameIndex < SCALE_NAMES.length ? SCALE_NAMES[nameIndex] : undefined) ??
			`${Math.floor(nameIndex / SCALE_NAMES.length) + 1}xl`;

		tokens.push({
			name,
			fontSize,
			lineHeight,
			letterSpacing,
			weight,
		});
	}

	// Generate CSS variables
	const cssLines: string[] = [];
	for (const token of tokens) {
		const value =
			unit === "px"
				? `${token.fontSize}px`
				: `${(token.fontSize / 16).toFixed(4).replace(/\.?0+$/, "")}${unit}`;

		cssLines.push(`  --${prefix}-${token.name}: ${value};`);
		cssLines.push(`  --line-height-${token.name}: ${token.lineHeight};`);
		if (token.letterSpacing !== 0) {
			cssLines.push(
				`  --letter-spacing-${token.name}: ${token.letterSpacing}em;`,
			);
		}
	}

	const cssVariables = `:root {\n${cssLines.join("\n")}\n}`;

	return {
		base,
		ratio: numericRatio,
		ratioName,
		tokens,
		cssVariables,
	};
}

/**
 * Typography token for design system export
 */
export interface TypographyExportToken {
	name: string;
	value: string;
	lineHeight: number;
	letterSpacing: string;
	category: "typography";
}

/**
 * Generates typography tokens for design system export.
 *
 * @param config - Configuration options (same as generateTypographyScale)
 * @returns Array of tokens with name, value, lineHeight, letterSpacing, and category
 *
 * @example
 * ```typescript
 * generateTypographyTokens({ base: 16, stepsUp: 2, stepsDown: 1 })
 * // [
 * //   { name: "font-size-xs", value: "0.75rem", lineHeight: 1.7, letterSpacing: "0.02em", category: "typography" },
 * //   { name: "font-size-sm", value: "0.875rem", lineHeight: 1.6, letterSpacing: "0.01em", category: "typography" },
 * //   ...
 * // ]
 * ```
 */
export function generateTypographyTokens(
	config: TypographyScaleConfig = {},
): TypographyExportToken[] {
	const scale = generateTypographyScale(config);
	const unit = config.unit || "rem";

	return scale.tokens.map((token) => ({
		name: `font-size-${token.name}`,
		value:
			unit === "px"
				? `${token.fontSize}px`
				: `${(token.fontSize / 16).toFixed(4).replace(/\.?0+$/, "")}${unit}`,
		lineHeight: token.lineHeight,
		letterSpacing:
			token.letterSpacing === 0 ? "normal" : `${token.letterSpacing}em`,
		category: "typography" as const,
	}));
}
