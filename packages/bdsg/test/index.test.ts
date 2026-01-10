import { describe, expect, test } from "bun:test";
import * as bdsg from "../src/index";

describe("Module Exports", () => {
	describe("Color Utilities", () => {
		test("exports hexToRgb", () => {
			expect(typeof bdsg.hexToRgb).toBe("function");
		});

		test("exports rgbToHex", () => {
			expect(typeof bdsg.rgbToHex).toBe("function");
		});

		test("exports rgbToHsl", () => {
			expect(typeof bdsg.rgbToHsl).toBe("function");
		});

		test("exports hslToRgb", () => {
			expect(typeof bdsg.hslToRgb).toBe("function");
		});

		test("exports hexToHsl", () => {
			expect(typeof bdsg.hexToHsl).toBe("function");
		});

		test("exports hslToHex", () => {
			expect(typeof bdsg.hslToHex).toBe("function");
		});
	});

	describe("Contrast Functions", () => {
		test("exports calculateContrast", () => {
			expect(typeof bdsg.calculateContrast).toBe("function");
		});

		test("exports getRelativeLuminance", () => {
			expect(typeof bdsg.getRelativeLuminance).toBe("function");
		});

		test("exports meetsWCAG", () => {
			expect(typeof bdsg.meetsWCAG).toBe("function");
		});

		test("exports getWCAGCompliance", () => {
			expect(typeof bdsg.getWCAGCompliance).toBe("function");
		});

		test("exports clearLuminanceCache", () => {
			expect(typeof bdsg.clearLuminanceCache).toBe("function");
		});

		test("exports WCAG_REQUIREMENTS", () => {
			expect(bdsg.WCAG_REQUIREMENTS).toBeDefined();
			expect(bdsg.WCAG_REQUIREMENTS.AA.normal).toBe(4.5);
		});
	});

	describe("Adjustment Functions", () => {
		test("exports adjustColorForContrast", () => {
			expect(typeof bdsg.adjustColorForContrast).toBe("function");
		});

		test("exports generateAccessibleVariations", () => {
			expect(typeof bdsg.generateAccessibleVariations).toBe("function");
		});
	});

	describe("Palette Functions", () => {
		test("exports generatePalette", () => {
			expect(typeof bdsg.generatePalette).toBe("function");
		});

		test("exports generatePaletteTokens", () => {
			expect(typeof bdsg.generatePaletteTokens).toBe("function");
		});
	});

	describe("Relations Functions", () => {
		test("exports detectRelations", () => {
			expect(typeof bdsg.detectRelations).toBe("function");
		});

		test("exports wouldCreateDirectCycle", () => {
			expect(typeof bdsg.wouldCreateDirectCycle).toBe("function");
		});
	});

	describe("Shadow Functions", () => {
		test("exports generateShadows", () => {
			expect(typeof bdsg.generateShadows).toBe("function");
		});

		test("exports generateShadowTokens", () => {
			expect(typeof bdsg.generateShadowTokens).toBe("function");
		});

		test("exports SHADOW_PRESETS", () => {
			expect(bdsg.SHADOW_PRESETS).toBeDefined();
			expect(bdsg.SHADOW_PRESETS.material).toBeDefined();
		});
	});

	describe("Spacing Functions", () => {
		test("exports generateSpacingScale", () => {
			expect(typeof bdsg.generateSpacingScale).toBe("function");
		});

		test("exports generateSpacingTokens", () => {
			expect(typeof bdsg.generateSpacingTokens).toBe("function");
		});

		test("exports SPACING_PRESETS", () => {
			expect(bdsg.SPACING_PRESETS).toBeDefined();
			expect(bdsg.SPACING_PRESETS.tailwind).toBeDefined();
		});
	});

	describe("Typography Functions", () => {
		test("exports generateTypographyScale", () => {
			expect(typeof bdsg.generateTypographyScale).toBe("function");
		});

		test("exports generateTypographyTokens", () => {
			expect(typeof bdsg.generateTypographyTokens).toBe("function");
		});

		test("exports TYPOGRAPHY_RATIOS", () => {
			expect(bdsg.TYPOGRAPHY_RATIOS).toBeDefined();
			expect(bdsg.TYPOGRAPHY_RATIOS["golden-ratio"]).toBeCloseTo(1.618, 2);
		});
	});

	describe("Integration Smoke Tests", () => {
		test("color utilities work end-to-end", () => {
			const rgb = bdsg.hexToRgb("#FF0000");
			const hex = bdsg.rgbToHex(rgb);
			expect(hex).toBe("#ff0000");
		});

		test("contrast calculation works", () => {
			const ratio = bdsg.calculateContrast("#000000", "#FFFFFF");
			expect(ratio).toBeCloseTo(21, 0);
		});

		test("palette generation works", () => {
			const palette = bdsg.generatePalette("#3B82F6");
			expect(Object.keys(palette.shades)).toHaveLength(10);
		});

		test("typography scale works", () => {
			const scale = bdsg.generateTypographyScale();
			expect(scale.tokens.length).toBeGreaterThan(0);
		});

		test("spacing scale works", () => {
			const scale = bdsg.generateSpacingScale();
			expect(scale.tokens.length).toBeGreaterThan(0);
		});

		test("shadow scale works", () => {
			const scale = bdsg.generateShadows();
			expect(scale.tokens.length).toBeGreaterThan(0);
		});
	});
});
