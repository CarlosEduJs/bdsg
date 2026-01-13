/**
 * OKLCH Color Space Utilities
 *
 * OKLCH is a perceptually uniform color space that provides:
 * - Uniform lightness perception across hues
 * - Better gradient interpolation without "muddy" zones
 * - More intuitive color manipulation
 *
 * Conversion path: HEX → sRGB → Linear RGB → OKLAB → OKLCH
 */

import { hexToRgb, rgbToHex } from "./color-utils";
import {
	InterpolationFactorSchema,
	validateHexColor,
	validateOklch,
} from "./schemas";
import type { RGB } from "./types/color-utils.types";

export type { OKLCH } from "./types/oklch.types";

import type { OKLCH } from "./types/oklch.types";

/**
 * OKLAB color representation (intermediate)
 */
interface OKLAB {
	l: number;
	a: number;
	b: number;
}

/**
 * Convert sRGB component to linear RGB
 * Applies inverse gamma correction
 */
function srgbToLinear(c: number): number {
	const abs = Math.abs(c);
	if (abs <= 0.04045) {
		return c / 12.92;
	}
	return Math.sign(c) * ((abs + 0.055) / 1.055) ** 2.4;
}

/**
 * Convert linear RGB component to sRGB
 * Applies gamma correction
 */
function linearToSrgb(c: number): number {
	const abs = Math.abs(c);
	if (abs <= 0.0031308) {
		return c * 12.92;
	}
	return Math.sign(c) * (1.055 * abs ** (1 / 2.4) - 0.055);
}

/**
 * Convert RGB (0-255) to OKLAB
 */
function rgbToOklab(rgb: RGB): OKLAB {
	// Normalize to 0-1 and convert to linear RGB
	const r = srgbToLinear(rgb.r / 255);
	const g = srgbToLinear(rgb.g / 255);
	const b = srgbToLinear(rgb.b / 255);

	// RGB to LMS matrix (Oklab specific)
	const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
	const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
	const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

	// Cube root
	const l_ = Math.cbrt(l);
	const m_ = Math.cbrt(m);
	const s_ = Math.cbrt(s);

	// LMS to OKLAB
	return {
		l: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
		a: 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
		b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
	};
}

/**
 * Convert OKLAB to RGB (0-255)
 */
function oklabToRgb(lab: OKLAB): RGB {
	// OKLAB to LMS
	const l_ = lab.l + 0.3963377774 * lab.a + 0.2158037573 * lab.b;
	const m_ = lab.l - 0.1055613458 * lab.a - 0.0638541728 * lab.b;
	const s_ = lab.l - 0.0894841775 * lab.a - 1.291485548 * lab.b;

	// Cube
	const l = l_ * l_ * l_;
	const m = m_ * m_ * m_;
	const s = s_ * s_ * s_;

	// LMS to linear RGB
	const rLin = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
	const gLin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
	const bLin = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

	// Linear RGB to sRGB, clamp, and scale to 0-255
	return {
		r: Math.round(Math.max(0, Math.min(1, linearToSrgb(rLin))) * 255),
		g: Math.round(Math.max(0, Math.min(1, linearToSrgb(gLin))) * 255),
		b: Math.round(Math.max(0, Math.min(1, linearToSrgb(bLin))) * 255),
	};
}

/**
 * Convert OKLAB to OKLCH
 */
function oklabToOklch(lab: OKLAB): OKLCH {
	const c = Math.sqrt(lab.a * lab.a + lab.b * lab.b);
	let h = (Math.atan2(lab.b, lab.a) * 180) / Math.PI;
	if (h < 0) h += 360;

	return {
		l: lab.l,
		c,
		h: c < 0.0001 ? 0 : h, // achromatic colors have no hue
	};
}

/**
 * Convert OKLCH to OKLAB
 */
function oklchToOklab(lch: OKLCH): OKLAB {
	const hRad = (lch.h * Math.PI) / 180;
	return {
		l: lch.l,
		a: lch.c * Math.cos(hRad),
		b: lch.c * Math.sin(hRad),
	};
}

/**
 * Convert HEX color to OKLCH
 *
 * @param hex - Hex color string (e.g., "#3B82F6")
 * @returns OKLCH object with l (0-1), c (0-0.4+), h (0-360)
 * @throws Error if hex color is invalid
 *
 * @example
 * ```typescript
 * hexToOklch("#3B82F6")
 * // { l: 0.623, c: 0.185, h: 259.5 }
 * ```
 */
export function hexToOklch(hex: string): OKLCH {
	validateHexColor(hex, "hex color");
	const rgb = hexToRgb(hex);
	const lab = rgbToOklab(rgb);
	return oklabToOklch(lab);
}

/**
 * Convert OKLCH to HEX color
 *
 * @param lch - OKLCH object
 * @returns Hex color string
 * @throws Error if OKLCH values are invalid
 *
 * @example
 * ```typescript
 * oklchToHex({ l: 0.623, c: 0.185, h: 259.5 })
 * // "#3b82f6"
 * ```
 */
export function oklchToHex(lch: OKLCH): string {
	validateOklch(lch, "OKLCH input");
	const lab = oklchToOklab(lch);
	const rgb = oklabToRgb(lab);
	return rgbToHex(rgb);
}

/**
 * Interpolate between two OKLCH colors
 *
 * This produces smoother gradients than RGB interpolation,
 * avoiding the "muddy middle" problem.
 *
 * @param color1 - Start color in OKLCH
 * @param color2 - End color in OKLCH
 * @param t - Interpolation factor (0-1)
 * @returns Interpolated OKLCH color
 * @throws Error if inputs are invalid
 *
 * @example
 * ```typescript
 * const start = hexToOklch("#FF0000"); // Red
 * const end = hexToOklch("#00FF00");   // Green
 * const middle = interpolateOklch(start, end, 0.5);
 * // Produces a vibrant yellow, not muddy brown
 * ```
 */
export function interpolateOklch(
	color1: OKLCH,
	color2: OKLCH,
	t: number,
): OKLCH {
	// Validate inputs
	validateOklch(color1, "color1");
	validateOklch(color2, "color2");

	// Clamp t (but validate it's at least a number)
	const tResult = InterpolationFactorSchema.safeParse(t);
	const factor = tResult.success ? t : Math.max(0, Math.min(1, t));

	// Interpolate lightness and chroma linearly
	const l = color1.l + (color2.l - color1.l) * factor;
	const c = color1.c + (color2.c - color1.c) * factor;

	// Interpolate hue along shortest path
	let h1 = color1.h;
	let h2 = color2.h;

	// Handle achromatic colors
	if (color1.c < 0.0001) h1 = h2;
	if (color2.c < 0.0001) h2 = h1;

	// Find shortest path around the color wheel
	let deltaH = h2 - h1;
	if (deltaH > 180) deltaH -= 360;
	if (deltaH < -180) deltaH += 360;

	let h = h1 + deltaH * factor;
	if (h < 0) h += 360;
	if (h >= 360) h -= 360;

	return { l, c, h };
}
