/**
 * Color adjustment type definitions
 */

/**
 * Adjustment result
 */
export interface AdjustmentResult {
	original: string;
	adjusted: string;
	ratio: number;
	iterations: number;
	strategy: "lightness" | "chroma" | "fallback";
}

/**
 * Color variations with accessible text color
 */
export interface ColorVariations {
	/** Base accessible color */
	base: string;
	/** Lighter variant */
	light: string;
	/** Darker variant */
	dark: string;
	/** Best text color (black or white) for use on base */
	text: string;
}
