/**
 * Gradient Generation Module
 *
 * Generates color gradients using OKLCH interpolation for perceptually smooth transitions.
 * Designed for future expansion with different gradient types and easing functions.
 */

import { hexToOklch, oklchToHex } from "./oklch";
import type { OKLCH } from "./types/oklch.types";

/**
 * Easing function type
 */
export type EasingFunction = (t: number) => number;

/**
 * Gradient color stop
 */
export interface GradientStop {
	color: string;
	position: number; // 0-1
}

/**
 * Gradient configuration
 */
export interface GradientConfig {
	/** Color interpolation method */
	interpolation?: "oklch" | "linear";
	/** Easing function for transition */
	easing?: EasingFunction;
	/** Hue interpolation direction for OKLCH */
	hueDirection?: "shorter" | "longer" | "increasing" | "decreasing";
}

/**
 * Built-in easing functions
 */
export const EASING = {
	linear: (t: number) => t,
	easeIn: (t: number) => t * t,
	easeOut: (t: number) => t * (2 - t),
	easeInOut: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
} as const;

/**
 * Interpolate hue with direction control
 */
function interpolateHue(
	h1: number,
	h2: number,
	t: number,
	direction: GradientConfig["hueDirection"] = "shorter",
): number {
	// Handle achromatic
	if (h1 === 0 && h2 === 0) return 0;

	let delta = h2 - h1;

	switch (direction) {
		case "shorter":
			if (delta > 180) delta -= 360;
			if (delta < -180) delta += 360;
			break;
		case "longer":
			if (delta > 0 && delta < 180) delta -= 360;
			if (delta < 0 && delta > -180) delta += 360;
			break;
		case "increasing":
			if (delta < 0) delta += 360;
			break;
		case "decreasing":
			if (delta > 0) delta -= 360;
			break;
	}

	let h = h1 + delta * t;
	if (h < 0) h += 360;
	if (h >= 360) h -= 360;
	return h;
}

/**
 * Generate a gradient array between two hex colors
 *
 * @param startHex - Start color in hex
 * @param endHex - End color in hex
 * @param steps - Number of color stops
 * @param config - Optional gradient configuration
 * @returns Array of hex colors
 *
 * @example
 * ```typescript
 * // Simple gradient
 * generateGradient("#FF0000", "#0000FF", 5)
 *
 * // With easing
 * generateGradient("#FF0000", "#0000FF", 5, { easing: EASING.easeInOut })
 *
 * // Control hue direction (go the long way around the color wheel)
 * generateGradient("#FF0000", "#FF8800", 5, { hueDirection: "longer" })
 * ```
 */
export function generateGradient(
	startHex: string,
	endHex: string,
	steps: number,
	config: GradientConfig = {},
): string[] {
	const { easing = EASING.linear, hueDirection = "shorter" } = config;

	const start = hexToOklch(startHex);
	const end = hexToOklch(endHex);
	const colors: string[] = [];

	for (let i = 0; i < steps; i++) {
		const rawT = i / (steps - 1);
		const t = easing(rawT);

		const interpolated: OKLCH = {
			l: start.l + (end.l - start.l) * t,
			c: start.c + (end.c - start.c) * t,
			h: interpolateHue(start.h, end.h, t, hueDirection),
		};

		colors.push(oklchToHex(interpolated));
	}

	return colors;
}

/**
 * Generate a multi-stop gradient
 *
 * @param stops - Array of gradient stops with color and position
 * @param steps - Total number of output colors
 * @param config - Optional gradient configuration
 * @returns Array of hex colors
 *
 * @example
 * ```typescript
 * generateMultiStopGradient([
 *   { color: "#FF0000", position: 0 },
 *   { color: "#FFFF00", position: 0.3 },
 *   { color: "#00FF00", position: 1 }
 * ], 10)
 * ```
 */
export function generateMultiStopGradient(
	stops: GradientStop[],
	steps: number,
	config: GradientConfig = {},
): string[] {
	if (stops.length < 2) {
		throw new Error("At least 2 stops required for gradient");
	}

	// Sort stops by position
	const sortedStops = [...stops].sort((a, b) => a.position - b.position);

	const colors: string[] = [];

	for (let i = 0; i < steps; i++) {
		const position = i / (steps - 1);

		// Find surrounding stops
		const firstStop = sortedStops[0];
		const lastStop = sortedStops[sortedStops.length - 1];
		if (!firstStop || !lastStop) {
			throw new Error("Invalid gradient stops");
		}

		let startStop = firstStop;
		let endStop = lastStop;

		for (let j = 0; j < sortedStops.length - 1; j++) {
			const currentStop = sortedStops[j];
			const nextStop = sortedStops[j + 1];
			if (
				currentStop &&
				nextStop &&
				position >= currentStop.position &&
				position <= nextStop.position
			) {
				startStop = currentStop;
				endStop = nextStop;
				break;
			}
		}

		// Calculate local t within this segment
		const segmentLength = endStop.position - startStop.position;
		const localT =
			segmentLength === 0 ? 0 : (position - startStop.position) / segmentLength;

		// Apply easing
		const easedT = (config.easing ?? EASING.linear)(localT);

		// Interpolate
		const startOklch = hexToOklch(startStop.color);
		const endOklch = hexToOklch(endStop.color);

		const interpolated: OKLCH = {
			l: startOklch.l + (endOklch.l - startOklch.l) * easedT,
			c: startOklch.c + (endOklch.c - startOklch.c) * easedT,
			h: interpolateHue(
				startOklch.h,
				endOklch.h,
				easedT,
				config.hueDirection ?? "shorter",
			),
		};

		colors.push(oklchToHex(interpolated));
	}

	return colors;
}

/**
 * Generate CSS gradient string
 *
 * @param type - Gradient type: "linear" | "radial" | "conic"
 * @param colors - Array of hex colors
 * @param angle - Angle for linear gradient (default: 90deg)
 * @returns CSS gradient string
 *
 * @example
 * ```typescript
 * const colors = generateGradient("#FF0000", "#0000FF", 3);
 * toCssGradient("linear", colors, 45)
 * // "linear-gradient(45deg, #ff0000, #800080, #0000ff)"
 * ```
 */
export function toCssGradient(
	type: "linear" | "radial" | "conic",
	colors: string[],
	angle = 90,
): string {
	const colorStr = colors.join(", ");

	switch (type) {
		case "linear":
			return `linear-gradient(${angle}deg, ${colorStr})`;
		case "radial":
			return `radial-gradient(circle, ${colorStr})`;
		case "conic":
			return `conic-gradient(from ${angle}deg, ${colorStr})`;
	}
}
