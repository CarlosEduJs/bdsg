/**
 * OKLCH-based Palette Generation
 * Generates a complete color palette from a base color using perceptually uniform OKLCH
 */

import { z } from "zod";
import { calculateContrast } from "./contrast";
import { hexToOklch, oklchToHex } from "./oklch";
import type { OKLCH } from "./types/oklch.types";

export type {
	ColorPalette,
	ColorShade,
	PaletteToken,
} from "./types/palette.types";

import type {
	ColorPalette,
	ColorShade,
	PaletteToken,
} from "./types/palette.types";

/**
 * Hex color validation schema
 * Accepts 3-character (#RGB) or 6-character (#RRGGBB) hex colors
 */
const HexColorSchema = z
	.string()
	.regex(
		/^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
		"Invalid hex color. Expected format: #RRGGBB or #RGB",
	);

/**
 * Shade configuration (OKLCH lightness targets)
 * OKLCH lightness is 0-1 (vs HSL's 0-100)
 */
const SHADE_CONFIG = {
	50: { lightness: 0.97 },
	100: { lightness: 0.93 },
	200: { lightness: 0.85 },
	300: { lightness: 0.75 },
	400: { lightness: 0.65 },
	500: { lightness: 0.55 }, // Base (will be overridden with exact color)
	600: { lightness: 0.45 },
	700: { lightness: 0.38 },
	800: { lightness: 0.3 },
	900: { lightness: 0.22 },
} as const;

type ShadeKey = keyof typeof SHADE_CONFIG;

/**
 * Calculate optimal text color (black or white) for a background
 */
function getOptimalTextColor(bgColor: string): {
	color: string;
	ratio: number;
} {
	const whiteRatio = calculateContrast("#ffffff", bgColor);
	const blackRatio = calculateContrast("#000000", bgColor);

	return whiteRatio >= blackRatio
		? { color: "#ffffff", ratio: whiteRatio }
		: { color: "#000000", ratio: blackRatio };
}

/**
 * Generate a single shade from base OKLCH
 * OKLCH provides perceptually uniform lightness adjustments
 */
function generateShade(baseOklch: OKLCH, targetLightness: number): ColorShade {
	const shadeOklch: OKLCH = {
		l: targetLightness,
		c: adjustChromaForLightness(baseOklch.c, targetLightness),
		h: baseOklch.h,
	};

	const value = oklchToHex(shadeOklch);
	const { color: textColor, ratio: contrastRatio } = getOptimalTextColor(value);

	return {
		value,
		textColor,
		contrastRatio: Number(contrastRatio.toFixed(2)),
	};
}

/**
 * Adjust chroma (saturation) based on lightness
 * Very light/dark colors need less chroma to stay in gamut and look good
 */
function adjustChromaForLightness(
	baseChroma: number,
	lightness: number,
): number {
	if (lightness >= 0.9) {
		// Very light - reduce chroma significantly
		return Math.min(0.05, baseChroma * 0.25);
	}
	if (lightness >= 0.75) {
		// Light - reduce chroma
		return Math.min(0.12, baseChroma * 0.6);
	}
	if (lightness <= 0.25) {
		// Very dark - reduce chroma
		return Math.min(0.1, baseChroma * 0.5);
	}
	if (lightness <= 0.35) {
		// Dark - reduce chroma slightly
		return Math.min(0.15, baseChroma * 0.7);
	}
	// Normal range - keep chroma (may still need clamping)
	return Math.min(0.25, baseChroma);
}

/**
 * Generate a complete color palette from a base color
 *
 * Uses OKLCH for perceptually uniform lightness distribution.
 * This produces more balanced palettes where each shade step
 * feels visually consistent across different hues.
 *
 * @param baseColor - Base color in hex format (e.g., "#3B82F6")
 * @param name - Optional name for the palette
 * @returns Complete palette with 10 shades and text colors
 *
 * @example
 * ```typescript
 * const palette = generatePalette("#3B82F6", "primary");
 * // palette.shades[500].value = "#3B82F6"
 * // palette.shades[100].value = "#DBEAFE"
 * // palette.shades[100].textColor = "#000000"
 * ```
 */
export function generatePalette(
	baseColor: string,
	name?: string,
): ColorPalette {
	const parseResult = HexColorSchema.safeParse(baseColor); // validate input color
	if (!parseResult.success) {
		throw new Error(
			`Invalid base color: "${baseColor}". ${parseResult.error.issues[0]?.message}`,
		);
	}

	const baseOklch = hexToOklch(baseColor);

	const shades = {} as ColorPalette["shades"];

	for (const [key, config] of Object.entries(SHADE_CONFIG)) {
		const shadeKey = Number(key) as ShadeKey;
		shades[shadeKey] = generateShade(baseOklch, config.lightness);
	}

	// Override 500 with exact base color
	const { color: baseTextColor, ratio: baseRatio } =
		getOptimalTextColor(baseColor);
	shades[500] = {
		value: baseColor,
		textColor: baseTextColor,
		contrastRatio: Number(baseRatio.toFixed(2)),
	};

	return {
		name,
		base: baseColor,
		shades,
	};
}

/**
 * Generates a palette as flat tokens for design system export.
 *
 * @param baseColor - Base color in hex format
 * @param name - Token name prefix (e.g., "primary")
 * @returns Array of tokens with name, value, textColor, and contrastRatio
 *
 * @example
 * ```typescript
 * const tokens = generatePaletteTokens("#3B82F6", "primary");
 * // [
 * //   { name: "primary-50", value: "#EFF6FF", textColor: "#000000", contrastRatio: 1.05 },
 * //   { name: "primary-100", value: "#DBEAFE", textColor: "#000000", contrastRatio: 1.12 },
 * //   ...
 * // ]
 * ```
 */
export function generatePaletteTokens(
	baseColor: string,
	name: string,
): PaletteToken[] {
	const palette = generatePalette(baseColor, name);

	return Object.entries(palette.shades).map(([shade, data]) => ({
		name: `${name}-${shade}`,
		value: data.value,
		textColor: data.textColor,
		contrastRatio: data.contrastRatio,
	}));
}
