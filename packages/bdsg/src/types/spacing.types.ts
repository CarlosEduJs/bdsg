/**
 * Spacing scale type definitions
 */

/**
 * Spacing scale methods
 */
export type SpacingMethod = "fibonacci" | "linear" | "exponential" | "t-shirt";

/**
 * Spacing token
 */
export interface SpacingToken {
	name: string;
	value: number;
	/** Formatted value with unit */
	formatted: string;
}

/**
 * Spacing scale configuration
 */
export interface SpacingScaleConfig {
	/** Base unit in pixels (default: 8) */
	base?: number;
	/** Generation method (default: "fibonacci") */
	method?: SpacingMethod;
	/** Number of steps (default: 10) */
	steps?: number;
	/** Unit for output (default: "rem") */
	unit?: "px" | "rem" | "em";
	/** Token name prefix (default: "spacing") */
	prefix?: string;
	/** Custom multiplier for exponential (default: 1.5) */
	exponent?: number;
}

/**
 * Complete spacing scale
 */
export interface SpacingScale {
	base: number;
	method: SpacingMethod;
	tokens: SpacingToken[];
	cssVariables: string;
}

/**
 * Spacing token for design system export
 */
export interface SpacingExportToken {
	name: string;
	value: string;
	px: number;
	category: "spacing";
}
