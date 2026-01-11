/**
 * Typography scale type definitions
 */

/**
 * Typography ratio names
 */
export type TypographyRatio =
	| "minor-second"
	| "major-second"
	| "minor-third"
	| "major-third"
	| "perfect-fourth"
	| "augmented-fourth"
	| "perfect-fifth"
	| "golden-ratio";

/**
 * Typography token with all properties
 */
export interface TypographyToken {
	name: string;
	fontSize: number;
	lineHeight: number;
	letterSpacing: number;
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
	/** Number of steps up from base (default: 3) */
	stepsUp?: number;
	/** Number of steps down from base (default: 2) */
	stepsDown?: number;
	/** Base line height (default: 1.5) */
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
 * Typography token for design system export
 */
export interface TypographyExportToken {
	name: string;
	value: string;
	lineHeight: number;
	letterSpacing: string;
	category: "typography";
}
