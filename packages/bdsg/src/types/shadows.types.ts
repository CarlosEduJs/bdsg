/**
 * Shadow generation type definitions
 */

/**
 * Shadow layer for multi-layer shadows
 */
export interface ShadowLayer {
	x: number;
	y: number;
	blur: number;
	spread: number;
	opacity: number;
}

/**
 * Complete shadow token
 */
export interface ShadowToken {
	name: string;
	/** Elevation level (0 = none, higher = more elevated) */
	elevation: number;
	/** Shadow layers */
	layers: ShadowLayer[];
	/** CSS value */
	value: string;
}

/**
 * Shadow generation configuration
 */
export interface ShadowConfig {
	/** Base color for shadow (default: "#000000") */
	color?: string;
	/** Base opacity (default: 0.1) */
	baseOpacity?: number;
	/** Number of elevation levels (default: 6) */
	levels?: number;
	/** Use multiple layers for realism (default: true) */
	layered?: boolean;
	/** Token name prefix (default: "shadow") */
	prefix?: string;
	/** Shadow style */
	style?: "material" | "soft" | "hard" | "inset";
}

/**
 * Complete shadow scale
 */
export interface ShadowScale {
	color: string;
	tokens: ShadowToken[];
	cssVariables: string;
}

/**
 * Shadow token for design system export
 */
export interface ShadowExportToken {
	name: string;
	value: string;
	elevation: number;
	category: "shadow";
}
