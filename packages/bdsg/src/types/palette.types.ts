/**
 * Palette generation type definitions
 */

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
 * Palette token for design system export
 */
export interface PaletteToken {
	name: string;
	value: string;
	textColor: string;
	contrastRatio: number;
}
