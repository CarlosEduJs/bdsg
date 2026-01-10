/**
 * Intelligent color adjustment for accessibility
 * Strategy: Lock hue, adjust lightness first, minimal chroma changes
 */

import { type HSL, hexToHsl, hslToHex } from "./color-utils";
import {
	calculateContrast,
	getRelativeLuminance,
	type TextSize,
	WCAG_REQUIREMENTS,
	type WCAGLevel,
} from "./contrast";

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
 * Adjusts a color to meet WCAG contrast requirements.
 *
 * Uses a multi-phase approach:
 * 1. Binary search on lightness (preserves hue)
 * 2. If needed, adjusts saturation
 * 3. Falls back to black/white if no solution found
 *
 * @param foreground - The color to adjust (hex format)
 * @param background - The background color to contrast against (hex format)
 * @param targetLevel - WCAG level to achieve (default: "AA")
 * @param textSize - Text size category (default: "normal")
 * @returns Adjustment result with original, adjusted color, ratio, and strategy used
 *
 * @example
 * ```typescript
 * // Adjust light blue to be readable on white
 * adjustColorForContrast("#87CEEB", "#FFFFFF", "AA", "normal")
 * // { original: "#87CEEB", adjusted: "#1A5276", ratio: 4.52, strategy: "lightness" }
 *
 * // Color already meets requirements
 * adjustColorForContrast("#1A5276", "#FFFFFF", "AA", "normal")
 * // { original: "#1A5276", adjusted: "#1A5276", ratio: 7.23, iterations: 0 }
 * ```
 */
export function adjustColorForContrast(
	foreground: string,
	background: string,
	targetLevel: WCAGLevel = "AA",
	textSize: TextSize = "normal",
): AdjustmentResult {
	const targetRatio = WCAG_REQUIREMENTS[targetLevel][textSize];

	// Check if already meets requirements
	const initialRatio = calculateContrast(foreground, background);
	if (initialRatio >= targetRatio) {
		return {
			original: foreground,
			adjusted: foreground,
			ratio: initialRatio,
			iterations: 0,
			strategy: "lightness",
		};
	}

	const fgHsl = hexToHsl(foreground);
	const originalSaturation = fgHsl.s;

	const fgLuminance = getRelativeLuminance(foreground);
	const bgLuminance = getRelativeLuminance(background);
	const shouldLighten = fgLuminance < bgLuminance;

	let iterations = 0;

	// Phase 1: Binary search for optimal lightness (O(log n) instead of O(n))
	let low = shouldLighten ? fgHsl.l : 0;
	let high = shouldLighten ? 100 : fgHsl.l;
	let bestResult: { l: number; ratio: number } | null = null;

	while (high - low > 0.5 && iterations < 20) {
		const mid = (low + high) / 2;
		const testColor = hslToHex({ ...fgHsl, l: mid });
		const ratio = calculateContrast(testColor, background);
		iterations++;

		if (ratio >= targetRatio) {
			bestResult = { l: mid, ratio };
			if (shouldLighten) {
				high = mid;
			} else {
				low = mid;
			}
		} else {
			if (shouldLighten) {
				low = mid; // Need more lightness
			} else {
				high = mid; // Need less lightness
			}
		}
	}

	if (bestResult) {
		const adjusted = hslToHex({ ...fgHsl, l: bestResult.l });
		return {
			original: foreground,
			adjusted,
			ratio: bestResult.ratio,
			iterations,
			strategy: "lightness",
		};
	}

	// Phase 2: Binary search on saturation if lightness maxed out
	const maxedLightness = shouldLighten ? 98 : 2;
	low = 0;
	high = originalSaturation;

	while (high - low > 1 && iterations < 40) {
		const mid = (low + high) / 2;
		const testColor = hslToHex({ h: fgHsl.h, s: mid, l: maxedLightness });
		const ratio = calculateContrast(testColor, background);
		iterations++;

		if (ratio >= targetRatio) {
			bestResult = { l: mid, ratio }; // Reusing l for saturation here
			low = mid; // Try higher saturation (preserve color more)
		} else {
			high = mid; // Need less saturation
		}
	}

	if (bestResult) {
		const adjusted = hslToHex({
			h: fgHsl.h,
			s: bestResult.l,
			l: maxedLightness,
		});
		return {
			original: foreground,
			adjusted,
			ratio: bestResult.ratio,
			iterations,
			strategy: "chroma",
		};
	}

	// Phase 3: Fallback to black or white
	const whiteRatio = calculateContrast("#ffffff", background);
	const blackRatio = calculateContrast("#000000", background);

	return whiteRatio > blackRatio
		? {
				original: foreground,
				adjusted: "#ffffff",
				ratio: whiteRatio,
				iterations,
				strategy: "fallback",
			}
		: {
				original: foreground,
				adjusted: "#000000",
				ratio: blackRatio,
				iterations,
				strategy: "fallback",
			};
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

/**
 * Generates accessible color variations from a base color.
 *
 * Creates light and dark variants while maintaining the color's hue,
 * and determines the best text color (black or white) for the base.
 *
 * @param baseColor - The starting color (hex format)
 * @param background - Background color for accessibility checks (default: "#FFFFFF")
 * @returns Object with base, light, dark, and text color variants
 *
 * @example
 * ```typescript
 * generateAccessibleVariations("#3B82F6", "#FFFFFF")
 * // {
 * //   base: "#2563EB",   // Adjusted for AA compliance
 * //   light: "#60A5FA",  // +30 lightness, -10 saturation
 * //   dark: "#1E40AF",   // -30 lightness, +10 saturation
 * //   text: "#FFFFFF"    // Best contrast on base
 * // }
 * ```
 */

export function generateAccessibleVariations(
	baseColor: string,
	background = "#FFFFFF",
): ColorVariations {
	// to accessible
	const baseAdjusted = adjustColorForContrast(
		baseColor,
		background,
		"AA",
		"normal",
	);

	const baseHsl = hexToHsl(baseAdjusted.adjusted);

	// Light variant: increase lightness, keep hue
	const lightHsl: HSL = {
		h: baseHsl.h,
		s: Math.max(0, baseHsl.s - 10), // Slightly less saturated
		l: Math.min(100, baseHsl.l + 30),
	};

	// Dark variant: decrease lightness, keep hue
	const darkHsl: HSL = {
		h: baseHsl.h,
		s: Math.min(100, baseHsl.s + 10), // Slightly more saturated
		l: Math.max(0, baseHsl.l - 30),
	};

	// Find best text color
	const whiteContrast = calculateContrast("#ffffff", baseAdjusted.adjusted);
	const blackContrast = calculateContrast("#000000", baseAdjusted.adjusted);
	const text = whiteContrast > blackContrast ? "#ffffff" : "#000000";

	return {
		base: baseAdjusted.adjusted,
		light: hslToHex(lightHsl),
		dark: hslToHex(darkHsl),
		text,
	};
}
