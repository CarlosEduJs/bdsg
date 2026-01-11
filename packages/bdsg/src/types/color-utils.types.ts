/**
 * Color space type definitions
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
