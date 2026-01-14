/**
 * OKLCH type definitions
 *
 * OKLCH is a perceptually uniform color space.
 */

/**
 * OKLCH color representation
 * L: Lightness (0-1)
 * C: Chroma (0-0.4+ for vivid colors)
 * H: Hue angle in degrees (0-360)
 */
export interface OKLCH {
	l: number;
	c: number;
	h: number;
}
