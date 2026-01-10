/**
 * WCAG 2.1 Contrast Calculation
 * Based on: https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */

import { hexToRgb } from "./color-utils";

/**
 * Luminance cache for performance optimization
 */
const luminanceCache = new Map<string, number>();

/**
 * Clears the luminance cache.
 *
 * Useful for testing or when memory management is needed.
 * The cache stores previously calculated luminance values to improve
 * performance when checking multiple color pairs.
 *
 * @example
 * ```typescript
 * clearLuminanceCache();
 * ```
 */
export function clearLuminanceCache(): void {
	luminanceCache.clear();
}

/**
 * Calculates relative luminance according to WCAG 2.1 specification.
 *
 * Results are cached for performance when checking multiple color pairs.
 * Uses sRGB color space with gamma correction.
 *
 * @param hex - The hex color string to calculate luminance for
 * @returns Relative luminance value between 0 (black) and 1 (white)
 * @see https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 *
 * @example
 * ```typescript
 * getRelativeLuminance("#FFFFFF")  // 1.0
 * getRelativeLuminance("#000000")  // 0.0
 * getRelativeLuminance("#808080")  // ~0.216
 * ```
 */
export function getRelativeLuminance(hex: string): number {
	// Normalize hex to ensure consistent cache keys (e.g., "#FFF" and "#ffffff" map to same entry)
	const normalizedHex = hex.trim().toUpperCase();
	const cached = luminanceCache.get(normalizedHex);
	if (cached !== undefined) {
		return cached;
	}

	const { r, g, b } = hexToRgb(hex);

	const rsRGB = r / 255;
	const gsRGB = g / 255;
	const bsRGB = b / 255;

	const rLinear =
		rsRGB <= 0.03928 ? rsRGB / 12.92 : ((rsRGB + 0.055) / 1.055) ** 2.4;

	const gLinear =
		gsRGB <= 0.03928 ? gsRGB / 12.92 : ((gsRGB + 0.055) / 1.055) ** 2.4;

	const bLinear =
		bsRGB <= 0.03928 ? bsRGB / 12.92 : ((bsRGB + 0.055) / 1.055) ** 2.4;

	const luminance = 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;

	luminanceCache.set(normalizedHex, luminance);

	return luminance;
}

/**
 * Calculates the contrast ratio between two colors.
 *
 * The ratio ranges from 1:1 (no contrast) to 21:1 (maximum contrast).
 * Per WCAG 2.1 specification: (L1 + 0.05) / (L2 + 0.05)
 *
 * @param foreground - Foreground color in hex format
 * @param background - Background color in hex format
 * @returns Contrast ratio between 1 and 21
 * @see https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 *
 * @example
 * ```typescript
 * calculateContrast("#000000", "#FFFFFF")  // 21
 * calculateContrast("#FFFFFF", "#FFFFFF")  // 1
 * calculateContrast("#767676", "#FFFFFF")  // ~4.54 (AA compliant)
 * ```
 */
export function calculateContrast(
	foreground: string,
	background: string,
): number {
	const l1 = getRelativeLuminance(foreground);
	const l2 = getRelativeLuminance(background);

	const lighter = Math.max(l1, l2);
	const darker = Math.min(l1, l2);

	return (lighter + 0.05) / (darker + 0.05);
}

/**
 * WCAG conformance levels
 */
export type WCAGLevel = "AA" | "AAA";

/**
 * Text size categories
 */
export type TextSize = "normal" | "large";

/**
 * WCAG 2.1 minimum contrast requirements
 */
export const WCAG_REQUIREMENTS = {
	AA: {
		normal: 4.5,
		large: 3.0,
		ui: 3.0,
	},
	AAA: {
		normal: 7.0,
		large: 4.5,
		ui: 3.0,
	},
} as const;

/**
 * Checks if a contrast ratio meets WCAG requirements.
 *
 * @param ratio - The contrast ratio to check
 * @param level - WCAG conformance level ("AA" or "AAA")
 * @param size - Text size category ("normal" or "large")
 * @returns True if the ratio meets the requirements
 *
 * @example
 * ```typescript
 * meetsWCAG(4.5, "AA", "normal")  // true
 * meetsWCAG(4.5, "AAA", "normal") // false (AAA requires 7.0)
 * meetsWCAG(3.0, "AA", "large")   // true
 * ```
 */
export function meetsWCAG(
	ratio: number,
	level: WCAGLevel,
	size: TextSize,
): boolean {
	return ratio >= WCAG_REQUIREMENTS[level][size];
}

/**
 * WCAG compliance result
 */
export interface WCAGCompliance {
	ratio: number;
	AA: boolean;
	AAA: boolean;
	level: "fail" | "AA" | "AAA";
}

/**
 * Gets the WCAG compliance status for a contrast ratio.
 *
 * Returns an object indicating whether the ratio passes AA, AAA,
 * and the highest level achieved.
 *
 * @param ratio - The contrast ratio to evaluate
 * @param size - Text size category (default: "normal")
 * @returns Compliance object with AA, AAA booleans and overall level
 *
 * @example
 * ```typescript
 * getWCAGCompliance(7.5, "normal")
 * // { ratio: 7.5, AA: true, AAA: true, level: "AAA" }
 *
 * getWCAGCompliance(3.0, "normal")
 * // { ratio: 3.0, AA: false, AAA: false, level: "fail" }
 * ```
 */
export function getWCAGCompliance(
	ratio: number,
	size: TextSize = "normal",
): WCAGCompliance {
	const AA = meetsWCAG(ratio, "AA", size);
	const AAA = meetsWCAG(ratio, "AAA", size);

	let level: "fail" | "AA" | "AAA" = "fail";
	if (AAA) level = "AAA";
	else if (AA) level = "AA";

	return {
		ratio,
		AA,
		AAA,
		level,
	};
}
