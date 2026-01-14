/**
 * shared Zod Validation Schemas - improved schemas validation
 *
 * Centralized validation schemas for consistency across all modules.
 * This ensures uniform error messages and validation rules.
 */

import { z } from "zod";

// Color Schemas

/**
 * Hex color validation schema
 * Accepts formats: #RGB, #RRGGBB, RGB, RRGGBB
 */
export const HexColorSchema = z
	.string()
	.regex(
		/^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
		"Invalid hex color. Expected format: #RRGGBB or #RGB",
	);

/**
 * OKLCH color validation schema
 * L: 0-1 (lightness)
 * C: 0+ (chroma, typically 0-0.4 for sRGB gamut)
 * H: 0-360 (hue angle in degrees)
 */
export const OklchSchema = z.object({
	l: z.number().min(0).max(1, "Lightness must be between 0 and 1"),
	c: z.number().min(0, "Chroma must be non-negative"),
	h: z.number().min(0).max(360, "Hue must be between 0 and 360"),
});

/**
 * RGB color validation schema (0-255 per channel)
 */
export const RgbSchema = z.object({
	r: z.number().int().min(0).max(255),
	g: z.number().int().min(0).max(255),
	b: z.number().int().min(0).max(255),
});

/**
 * HSL color validation schema
 */
export const HslSchema = z.object({
	h: z.number().min(0).max(360),
	s: z.number().min(0).max(100),
	l: z.number().min(0).max(100),
});

// Gradient Schemas

/**
 * Gradient stop validation schema
 */
export const GradientStopSchema = z.object({
	color: HexColorSchema,
	position: z.number().min(0).max(1, "Position must be between 0 and 1"),
});

/**
 * Hue direction enum
 */
export const HueDirectionSchema = z.enum([
	"shorter",
	"longer",
	"increasing",
	"decreasing",
]);

/**
 * Gradient config validation schema
 */
export const GradientConfigSchema = z
	.object({
		hueDirection: HueDirectionSchema.optional(),
	})
	.optional();

/**
 * Steps validation (minimum 2 for gradients)
 */
export const StepsSchema = z.number().int().min(2, "Steps must be at least 2");

/**
 * CSS gradient type
 */
export const CssGradientTypeSchema = z.enum(["linear", "radial", "conic"]);

/**
 * Angle validation (degrees)
 */
export const AngleSchema = z.number().min(0).max(360);

// Numeric Schemas

/**
 * Positive number schema
 */
export const PositiveNumberSchema = z.number().positive();

/**
 * Non-negative number schema
 */
export const NonNegativeNumberSchema = z.number().min(0);

/**
 * Integer schema
 */
export const IntegerSchema = z.number().int();

/**
 * Positive integer schema
 */
export const PositiveIntegerSchema = z.number().int().positive();

/**
 * Interpolation factor (0-1)
 */
export const InterpolationFactorSchema = z
	.number()
	.min(0)
	.max(1, "Interpolation factor must be between 0 and 1");

// Helper Functions

/**
 * Validate and throw with friendly error message
 */
export function validateOrThrow<T>(
	schema: z.ZodType<T>,
	value: unknown,
	context: string,
): T {
	const result = schema.safeParse(value);
	if (!result.success) {
		const message = result.error.issues[0]?.message ?? "Validation failed";
		throw new Error(`${context}: ${message}`);
	}
	return result.data;
}

/**
 * Validate hex color and throw with context
 */
export function validateHexColor(hex: string, context = "color"): string {
	return validateOrThrow(HexColorSchema, hex, `Invalid ${context}`);
}

/**
 * Validate OKLCH and throw with context
 */
export function validateOklch(
	oklch: unknown,
	context = "OKLCH color",
): z.infer<typeof OklchSchema> {
	return validateOrThrow(OklchSchema, oklch, `Invalid ${context}`);
}

/**
 * Validate steps and throw with context
 */
export function validateSteps(steps: number, context = "steps"): number {
	return validateOrThrow(StepsSchema, steps, `Invalid ${context}`);
}

// Type exports (inferred from schemas)

export type HexColor = z.infer<typeof HexColorSchema>;
export type OklchColor = z.infer<typeof OklchSchema>;
export type RgbColor = z.infer<typeof RgbSchema>;
export type HslColor = z.infer<typeof HslSchema>;
export type GradientStopInput = z.infer<typeof GradientStopSchema>;
export type HueDirection = z.infer<typeof HueDirectionSchema>;
export type GradientConfigInput = z.infer<typeof GradientConfigSchema>;
export type CssGradientType = z.infer<typeof CssGradientTypeSchema>;
