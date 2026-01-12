/**
 * Shadow Generation
 *
 * Generates realistic, layered shadows based on:
 * - Material Design elevation principles
 * - Light physics (soft shadows from multiple sources)
 * - Perceptual uniformity (smooth visual progression)
 */

import { z } from "zod";
import { hexToRgb } from "./color-utils";

export type {
	ShadowConfig,
	ShadowExportToken,
	ShadowLayer,
	ShadowScale,
	ShadowToken,
} from "./types/shadows.types";

import type {
	ShadowConfig,
	ShadowExportToken,
	ShadowLayer,
	ShadowScale,
	ShadowToken,
} from "./types/shadows.types";

/**
 * Shadow level names
 */
const SHADOW_NAMES = ["none", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"];

/**
 * Shadow config validation schema
 */
const ShadowConfigSchema = z.object({
	color: z
		.string()
		.regex(/^#[A-Fa-f0-9]{6}$/, "Shadow color must be a 6-digit hex color")
		.optional(),
	baseOpacity: z.number().min(0).max(1).optional(),
	levels: z.number().int().min(1).max(10).optional(),
	layered: z.boolean().optional(),
	prefix: z.string().optional(),
	style: z.enum(["material", "soft", "hard", "inset"]).optional(),
});

/**
 * Generate Material Design-style shadows
 * Uses 3 layers for realistic depth
 */
function generateMaterialShadow(
	elevation: number,
	baseOpacity: number,
): ShadowLayer[] {
	if (elevation === 0) return [];

	// Umbra (darkest, sharpest shadow directly beneath)
	const umbra: ShadowLayer = {
		x: 0,
		y: Math.round(elevation * 0.5),
		blur: Math.round(elevation * 0.8),
		spread: Math.round(elevation * -0.2),
		opacity: Math.round(baseOpacity * 0.14 * 100) / 100,
	};

	// Penumbra (medium shadow, medium blur)
	const penumbra: ShadowLayer = {
		x: 0,
		y: elevation,
		blur: Math.round(elevation * 1.5),
		spread: 0,
		opacity: Math.round(baseOpacity * 0.12 * 100) / 100,
	};

	// Ambient (softest, most diffuse shadow)
	const ambient: ShadowLayer = {
		x: 0,
		y: Math.round(elevation * 0.25),
		blur: Math.round(elevation * 2.5),
		spread: 0,
		opacity: Math.round(baseOpacity * 0.1 * 100) / 100,
	};

	return [umbra, penumbra, ambient];
}

/**
 * Generate soft, diffuse shadows
 * Single layer, high blur
 */
function generateSoftShadow(
	elevation: number,
	baseOpacity: number,
): ShadowLayer[] {
	if (elevation === 0) return [];

	return [
		{
			x: 0,
			y: Math.round(elevation * 0.5),
			blur: Math.round(elevation * 3),
			spread: 0,
			opacity: Math.round(baseOpacity * 0.15 * 100) / 100,
		},
	];
}

/**
 * Generate hard, defined shadows
 * Minimal blur, high contrast
 */
function generateHardShadow(
	elevation: number,
	baseOpacity: number,
): ShadowLayer[] {
	if (elevation === 0) return [];

	return [
		{
			x: 0,
			y: elevation,
			blur: Math.round(elevation * 0.5),
			spread: 0,
			opacity: Math.round(baseOpacity * 0.25 * 100) / 100,
		},
	];
}

/**
 * Generate inset shadows
 */
function generateInsetShadow(
	elevation: number,
	baseOpacity: number,
): ShadowLayer[] {
	if (elevation === 0) return [];

	return [
		{
			x: 0,
			y: elevation * -1,
			blur: Math.round(elevation * 2),
			spread: Math.round(elevation * -0.5),
			opacity: Math.round(baseOpacity * 0.15 * 100) / 100,
		},
	];
}

/**
 * Convert shadow layers to CSS value
 */
function layersToCss(
	layers: ShadowLayer[],
	color: string,
	inset = false,
): string {
	if (layers.length === 0) return "none";

	const { r, g, b } = hexToRgb(color);

	return layers
		.map((layer) => {
			const insetStr = inset ? "inset " : "";
			return `${insetStr}${layer.x}px ${layer.y}px ${layer.blur}px ${layer.spread}px rgba(${r}, ${g}, ${b}, ${layer.opacity})`;
		})
		.join(", ");
}

/**
 * Generates a shadow scale with multiple elevation levels.
 *
 * @param config - Configuration options
 * @param config.color - Shadow color in hex format (default: "#000000")
 * @param config.baseOpacity - Base opacity for shadows (default: 0.1)
 * @param config.levels - Number of elevation levels (default: 6)
 * @param config.layered - Use multi-layer Material shadows (default: true)
 * @param config.prefix - CSS variable prefix (default: "shadow")
 * @param config.style - Shadow style: "material" | "soft" | "hard" | "inset"
 * @returns Complete shadow scale with tokens and CSS variables
 * @throws Error if config values are invalid
 *
 * @example
 * ```typescript
 * // Material Design shadows (default)
 * generateShadows({ levels: 6 })
 * // Returns 7 levels (none through 2xl)
 *
 * // Soft shadows
 * generateShadows({ style: "soft", baseOpacity: 0.15 })
 *
 * // Hard shadows for retro look
 * generateShadows({ style: "hard" })
 * ```
 */
export function generateShadows(config: ShadowConfig = {}): ShadowScale {
	// Validate config
	const parseResult = ShadowConfigSchema.safeParse(config);
	if (!parseResult.success) {
		throw new Error(
			`Invalid shadow config: ${parseResult.error.issues[0]?.message}`,
		);
	}

	const {
		color = "#000000",
		baseOpacity = 0.1,
		levels = 6,
		layered = true,
		prefix = "shadow",
		style = "material",
	} = config;

	const tokens: ShadowToken[] = [];
	const isInset = style === "inset";

	// Level 0 = none
	tokens.push({
		name: "none",
		elevation: 0,
		layers: [],
		value: "none",
	});

	// Generate each elevation level
	for (let i = 1; i <= levels; i++) {
		// Elevation increases exponentially for visual consistency
		const elevation = Math.round(2 * 1.5 ** i);

		let layers: ShadowLayer[];

		switch (style) {
			case "material":
				layers = layered
					? generateMaterialShadow(elevation, baseOpacity)
					: generateSoftShadow(elevation, baseOpacity);
				break;
			case "soft":
				layers = generateSoftShadow(elevation, baseOpacity);
				break;
			case "hard":
				layers = generateHardShadow(elevation, baseOpacity);
				break;
			case "inset":
				layers = generateInsetShadow(elevation, baseOpacity);
				break;
			default:
				layers = generateMaterialShadow(elevation, baseOpacity);
		}

		const name =
			(i < SHADOW_NAMES.length ? SHADOW_NAMES[i] : undefined) ?? `${i}xl`;

		tokens.push({
			name,
			elevation,
			layers,
			value: layersToCss(layers, color, isInset),
		});
	}

	// Generate CSS variables
	const cssLines = tokens.map(
		(token) => `  --${prefix}-${token.name}: ${token.value};`,
	);
	const cssVariables = `:root {\n${cssLines.join("\n")}\n}`;

	return {
		color,
		tokens,
		cssVariables,
	};
}

export function generateShadowTokens(
	config: ShadowConfig = {},
): ShadowExportToken[] {
	const scale = generateShadows(config);

	return scale.tokens.map((token) => ({
		name: `shadow-${token.name}`,
		value: token.value,
		elevation: token.elevation,
		category: "shadow" as const,
	}));
}

/**
 * Common shadow presets
 */
export const SHADOW_PRESETS = {
	/** Material Design-like */
	material: {
		style: "material" as const,
		levels: 6,
		baseOpacity: 0.1,
	},
	/** Soft, modern shadows */
	soft: {
		style: "soft" as const,
		levels: 5,
		baseOpacity: 0.12,
	},
	/** Brutalist, hard shadows */
	brutalist: {
		style: "hard" as const,
		levels: 4,
		baseOpacity: 0.3,
	},
	/** Neumorphism-style inset */
	neumorphism: {
		style: "inset" as const,
		levels: 3,
		baseOpacity: 0.1,
	},
};
