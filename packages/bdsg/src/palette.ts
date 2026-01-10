/**
 * HSL-based Palette Generation
 * Generates a complete color palette from a base color
 */

import { z } from "zod";
import { type HSL, hexToHsl, hslToHex } from "./color-utils";
import { calculateContrast } from "./contrast";

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
 * Color shade with value and recommended text
 */
export interface ColorShade {
	value: string;
	textColor: string;
	contrastRatio: number;
}

/**
 * Complete color palette
 */
export interface ColorPalette {
	name?: string;
	base: string;
	shades: {
		50: ColorShade;
		100: ColorShade;
		200: ColorShade;
		300: ColorShade;
		400: ColorShade;
		500: ColorShade;
		600: ColorShade;
		700: ColorShade;
		800: ColorShade;
		900: ColorShade;
	};
}

/**
 * Shade configuration (lightness targets)
 */
const SHADE_CONFIG = {
	50: { lightness: 97 },
	100: { lightness: 93 },
	200: { lightness: 85 },
	300: { lightness: 75 },
	400: { lightness: 60 },
	500: { lightness: 50 }, // Base
	600: { lightness: 42 },
	700: { lightness: 35 },
	800: { lightness: 27 },
	900: { lightness: 20 },
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
 * Generate a single shade from base HSL
 */
function generateShade(baseHsl: HSL, targetLightness: number): ColorShade {
	const shadeHsl: HSL = {
		h: baseHsl.h,
		s: adjustSaturationForLightness(baseHsl.s, targetLightness),
		l: targetLightness,
	};

	const value = hslToHex(shadeHsl);
	const { color: textColor, ratio: contrastRatio } = getOptimalTextColor(value);

	return {
		value,
		textColor,
		contrastRatio: Number(contrastRatio.toFixed(2)),
	};
}

/**
 * Adjust saturation based on lightness
 * Very light/dark colors need less saturation to look good
 */
function adjustSaturationForLightness(
	baseSaturation: number,
	lightness: number,
): number {
	if (lightness >= 90) {
		// Very light - reduce saturation significantly
		return Math.max(10, baseSaturation * 0.3);
	}
	if (lightness >= 75) {
		// Light - reduce saturation
		return Math.max(20, baseSaturation * 0.6);
	}
	if (lightness <= 25) {
		// Very dark - reduce saturation
		return Math.max(30, baseSaturation * 0.7);
	}
	// Normal range - keep saturation
	return baseSaturation;
}

/**
 * Generate a complete color palette from a base color
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

	const baseHsl = hexToHsl(baseColor);

	const shades = {} as ColorPalette["shades"];

	for (const [key, config] of Object.entries(SHADE_CONFIG)) {
		const shadeKey = Number(key) as ShadeKey;
		shades[shadeKey] = generateShade(baseHsl, config.lightness);
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
 * Palette token for design system export
 */
export interface PaletteToken {
	name: string;
	value: string;
	textColor: string;
	contrastRatio: number;
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
