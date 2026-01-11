/**
 * WCAG contrast type definitions
 */

/**
 * WCAG conformance levels
 */
export type WCAGLevel = "AA" | "AAA";

/**
 * Text size categories
 */
export type TextSize = "normal" | "large";

/**
 * WCAG compliance result
 */
export interface WCAGCompliance {
	ratio: number;
	AA: boolean;
	AAA: boolean;
	level: "fail" | "AA" | "AAA";
}
