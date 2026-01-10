/**
 * Color space conversion utilities
 */

/**
 * RGB color (0-255)
 */
export interface RGB {
	r: number;
	g: number;
	b: number;
}

/**
 * HSL color (h: 0-360, s: 0-100, l: 0-100)
 */
export interface HSL {
	h: number;
	s: number;
	l: number;
}

/**
 * Normalize hex color string
 * - Adds # prefix if missing
 * - Converts shorthand (#RGB) to full format (#RRGGBB)
 * - Normalizes to uppercase
 */
function normalizeHex(hex: string): string {
	let normalized = hex.trim();

	// Add # if missing
	if (!normalized.startsWith("#")) {
		normalized = `#${normalized}`;
	}

	// Convert shorthand (#RGB) to full format (#RRGGBB)
	const shorthandMatch = /^#([A-Fa-f\d])([A-Fa-f\d])([A-Fa-f\d])$/.exec(
		normalized,
	);
	if (shorthandMatch) {
		const [, r, g, b] = shorthandMatch;
		normalized = `#${r}${r}${g}${g}${b}${b}`;
	}

	return normalized.toUpperCase();
}

/**
 * Converts a hex color string to RGB values.
 *
 * Supports both 3-character (#RGB) and 6-character (#RRGGBB) formats.
 * The # prefix is optional.
 *
 * @param hex - The hex color string to convert
 * @returns RGB object with r, g, b values (0-255)
 * @throws Error if the hex string is invalid
 *
 * @example
 * ```typescript
 * hexToRgb("#FF5733")  // { r: 255, g: 87, b: 51 }
 * hexToRgb("#FFF")     // { r: 255, g: 255, b: 255 }
 * hexToRgb("00FF00")   // { r: 0, g: 255, b: 0 }
 * ```
 */
export function hexToRgb(hex: string): RGB {
	const normalized = normalizeHex(hex);
	const result = /^#([A-F\d]{2})([A-F\d]{2})([A-F\d]{2})$/i.exec(normalized);

	if (!result) {
		throw new Error(
			`Invalid hex color: "${hex}". Expected format: #RRGGBB or #RGB`,
		);
	}

	const [, r = "", g = "", b = ""] = result;

	return {
		r: Number.parseInt(r, 16),
		g: Number.parseInt(g, 16),
		b: Number.parseInt(b, 16),
	};
}

/**
 * Converts RGB values to a hex color string.
 *
 * Values are clamped to the valid range (0-255).
 *
 * @param rgb - RGB object with r, g, b values
 * @returns Lowercase hex color string with # prefix
 *
 * @example
 * ```typescript
 * rgbToHex({ r: 255, g: 0, b: 0 })  // "#ff0000"
 * rgbToHex({ r: 0, g: 128, b: 255 }) // "#0080ff"
 * ```
 */
export function rgbToHex(rgb: RGB): string {
	const toHex = (n: number) =>
		Math.round(Math.max(0, Math.min(255, n)))
			.toString(16)
			.padStart(2, "0");

	return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * Converts RGB color to HSL color space.
 *
 * Based on the standard RGB to HSL conversion algorithm.
 *
 * @param rgb - RGB object with r, g, b values (0-255)
 * @returns HSL object with h (0-360), s (0-100), l (0-100)
 * @see https://en.wikipedia.org/wiki/HSL_and_HSV
 *
 * @example
 * ```typescript
 * rgbToHsl({ r: 255, g: 0, b: 0 })   // { h: 0, s: 100, l: 50 }
 * rgbToHsl({ r: 0, g: 0, b: 255 })   // { h: 240, s: 100, l: 50 }
 * ```
 */
export function rgbToHsl(rgb: RGB): HSL {
	const r = rgb.r / 255;
	const g = rgb.g / 255;
	const b = rgb.b / 255;

	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const delta = max - min;

	let h = 0;
	let s = 0;
	const l = (max + min) / 2;

	if (delta !== 0) {
		s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

		switch (max) {
			case r:
				h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
				break;
			case g:
				h = ((b - r) / delta + 2) / 6;
				break;
			case b:
				h = ((r - g) / delta + 4) / 6;
				break;
		}
	}

	return {
		h: Math.round(h * 360),
		s: Math.round(s * 100),
		l: Math.round(l * 100),
	};
}

/**
 * Converts HSL color to RGB color space.
 *
 * @param hsl - HSL object with h (0-360), s (0-100), l (0-100)
 * @returns RGB object with r, g, b values (0-255)
 *
 * @example
 * ```typescript
 * hslToRgb({ h: 0, s: 100, l: 50 })   // { r: 255, g: 0, b: 0 }
 * hslToRgb({ h: 120, s: 100, l: 50 }) // { r: 0, g: 255, b: 0 }
 * ```
 */
export function hslToRgb(hsl: HSL): RGB {
	const h = hsl.h / 360;
	const s = hsl.s / 100;
	const l = hsl.l / 100;

	let r: number;
	let g: number;
	let b: number;

	if (s === 0) {
		r = g = b = l;
	} else {
		const hue2rgb = (p: number, q: number, tParam: number) => {
			let t = tParam;
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		};

		const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		const p = 2 * l - q;

		r = hue2rgb(p, q, h + 1 / 3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1 / 3);
	}

	return {
		r: Math.round(r * 255),
		g: Math.round(g * 255),
		b: Math.round(b * 255),
	};
}

/**
 * Converts a hex color string directly to HSL.
 *
 * @param hex - The hex color string to convert
 * @returns HSL object with h (0-360), s (0-100), l (0-100)
 * @throws Error if the hex string is invalid
 *
 * @example
 * ```typescript
 * hexToHsl("#FF0000")  // { h: 0, s: 100, l: 50 }
 * ```
 */
export function hexToHsl(hex: string): HSL {
	return rgbToHsl(hexToRgb(hex));
}

/**
 * Converts HSL color directly to a hex string.
 *
 * @param hsl - HSL object with h (0-360), s (0-100), l (0-100)
 * @returns Lowercase hex color string with # prefix
 *
 * @example
 * ```typescript
 * hslToHex({ h: 0, s: 100, l: 50 })  // "#ff0000"
 * ```
 */
export function hslToHex(hsl: HSL): string {
	return rgbToHex(hslToRgb(hsl));
}
