import { describe, expect, test } from "bun:test";
import {
	hexToHsl,
	hexToRgb,
	hslToHex,
	hslToRgb,
	rgbToHex,
	rgbToHsl,
} from "../src/color-utils";

describe("Color Utilities", () => {
	describe("hexToRgb", () => {
		test("should convert 6-digit hex to RGB", () => {
			const rgb = hexToRgb("#FF5733");
			expect(rgb).toEqual({ r: 255, g: 87, b: 51 });
		});

		test("should convert 3-digit hex to RGB (shorthand)", () => {
			const rgb = hexToRgb("#FFF");
			expect(rgb).toEqual({ r: 255, g: 255, b: 255 });
		});

		test("should handle hex without # prefix", () => {
			const rgb = hexToRgb("00FF00");
			expect(rgb).toEqual({ r: 0, g: 255, b: 0 });
		});

		test("should handle lowercase hex", () => {
			const rgb = hexToRgb("#aabbcc");
			expect(rgb).toEqual({ r: 170, g: 187, b: 204 });
		});

		test("should throw error for invalid hex", () => {
			expect(() => hexToRgb("#GGG")).toThrow(/Invalid hex color/);
			expect(() => hexToRgb("invalid")).toThrow(/Invalid hex color/);
		});

		test("should handle hex with leading/trailing whitespace", () => {
			const rgb = hexToRgb("  #FF0000  ");
			expect(rgb).toEqual({ r: 255, g: 0, b: 0 });
		});
	});

	describe("rgbToHex", () => {
		test("should convert RGB to hex", () => {
			expect(rgbToHex({ r: 255, g: 0, b: 0 })).toBe("#ff0000");
		});

		test("should clamp values to valid range", () => {
			expect(rgbToHex({ r: 300, g: -10, b: 128 })).toBe("#ff0080");
		});

		test("should pad single digit values with zero", () => {
			expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe("#000000");
		});
	});

	describe("rgbToHsl", () => {
		test("should convert white to HSL", () => {
			const hsl = rgbToHsl({ r: 255, g: 255, b: 255 });
			expect(hsl.l).toBe(100);
			expect(hsl.s).toBe(0);
		});

		test("should convert black to HSL", () => {
			const hsl = rgbToHsl({ r: 0, g: 0, b: 0 });
			expect(hsl.l).toBe(0);
		});

		test("should convert red to HSL", () => {
			const hsl = rgbToHsl({ r: 255, g: 0, b: 0 });
			expect(hsl.h).toBe(0);
			expect(hsl.s).toBe(100);
			expect(hsl.l).toBe(50);
		});
	});

	describe("hslToRgb", () => {
		test("should convert HSL to RGB", () => {
			const rgb = hslToRgb({ h: 0, s: 100, l: 50 });
			expect(rgb).toEqual({ r: 255, g: 0, b: 0 });
		});

		test("should handle grayscale (saturation 0)", () => {
			const rgb = hslToRgb({ h: 0, s: 0, l: 50 });
			expect(rgb.r).toBe(rgb.g);
			expect(rgb.g).toBe(rgb.b);
		});
	});

	describe("round-trip conversions", () => {
		test("should preserve color through hex → HSL → hex", () => {
			const original = "#3B82F6";
			const hsl = hexToHsl(original);
			const result = hslToHex(hsl);
			// Allow small rounding differences
			expect(Math.abs(hexToRgb(result).r - hexToRgb(original).r)).toBeLessThan(
				5,
			);
		});

		test("should preserve color through RGB → HSL → RGB", () => {
			const original = { r: 128, g: 64, b: 192 };
			const hsl = rgbToHsl(original);
			const result = hslToRgb(hsl);
			expect(Math.abs(result.r - original.r)).toBeLessThan(2);
			expect(Math.abs(result.g - original.g)).toBeLessThan(2);
			expect(Math.abs(result.b - original.b)).toBeLessThan(2);
		});
	});
});

describe("Color Utilities Edge Cases", () => {
	describe("hexToRgb invalid inputs", () => {
		test("throws for 4-character hex", () => {
			expect(() => hexToRgb("#ABCD")).toThrow(/Invalid hex color/);
		});

		test("throws for 5-character hex", () => {
			expect(() => hexToRgb("#ABCDE")).toThrow(/Invalid hex color/);
		});

		test("throws for empty string", () => {
			expect(() => hexToRgb("")).toThrow(/Invalid hex color/);
		});

		test("throws for just hash", () => {
			expect(() => hexToRgb("#")).toThrow(/Invalid hex color/);
		});

		test("throws for 7-character hex (too long)", () => {
			expect(() => hexToRgb("#ABCDEFG")).toThrow(/Invalid hex color/);
		});
	});

	describe("rgbToHsl edge cases", () => {
		test("handles green primary color", () => {
			const hsl = rgbToHsl({ r: 0, g: 255, b: 0 });
			expect(hsl.h).toBe(120);
			expect(hsl.s).toBe(100);
			expect(hsl.l).toBe(50);
		});

		test("handles blue primary color", () => {
			const hsl = rgbToHsl({ r: 0, g: 0, b: 255 });
			expect(hsl.h).toBe(240);
			expect(hsl.s).toBe(100);
			expect(hsl.l).toBe(50);
		});

		test("handles mid-gray (all equal)", () => {
			const hsl = rgbToHsl({ r: 128, g: 128, b: 128 });
			expect(hsl.s).toBe(0); // No saturation for gray
			expect(hsl.l).toBe(50);
		});

		test("handles near-black", () => {
			const hsl = rgbToHsl({ r: 1, g: 1, b: 1 });
			expect(hsl.l).toBeLessThan(5);
		});

		test("handles near-white", () => {
			const hsl = rgbToHsl({ r: 254, g: 254, b: 254 });
			expect(hsl.l).toBeGreaterThan(95);
		});
	});

	describe("hslToRgb edge cases", () => {
		test("handles hue at 360 (wraps to 0)", () => {
			const rgb = hslToRgb({ h: 360, s: 100, l: 50 });
			// Should be same as hue 0 (red)
			expect(rgb.r).toBe(255);
		});

		test("handles hue > 360", () => {
			// Should wrap around
			const rgb = hslToRgb({ h: 480, s: 100, l: 50 });
			// 480 - 360 = 120 (green)
			expect(rgb.g).toBeGreaterThan(rgb.r);
		});

		test("handles lightness 0 (black)", () => {
			const rgb = hslToRgb({ h: 180, s: 100, l: 0 });
			expect(rgb).toEqual({ r: 0, g: 0, b: 0 });
		});

		test("handles lightness 100 (white)", () => {
			const rgb = hslToRgb({ h: 180, s: 100, l: 100 });
			expect(rgb).toEqual({ r: 255, g: 255, b: 255 });
		});

		test("handles saturation 0 at various lightness", () => {
			const light = hslToRgb({ h: 0, s: 0, l: 75 });
			expect(light.r).toBe(light.g);
			expect(light.g).toBe(light.b);
			expect(light.r).toBeCloseTo(191, 0);
		});
	});

	describe("direct conversion functions", () => {
		test("hexToHsl works correctly", () => {
			const hsl = hexToHsl("#FF0000");
			expect(hsl.h).toBe(0);
			expect(hsl.s).toBe(100);
			expect(hsl.l).toBe(50);
		});

		test("hslToHex works correctly", () => {
			const hex = hslToHex({ h: 0, s: 100, l: 50 });
			expect(hex).toBe("#ff0000");
		});

		test("hexToHsl → hslToHex round trip", () => {
			const original = "#3b82f6";
			const hsl = hexToHsl(original);
			const hex = hslToHex(hsl);
			// Should be very close (allow for rounding)
			const origRgb = hexToRgb(original);
			const resultRgb = hexToRgb(hex);
			expect(Math.abs(origRgb.r - resultRgb.r)).toBeLessThan(2);
		});
	});
});
