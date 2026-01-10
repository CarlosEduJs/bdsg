import { beforeEach, describe, expect, test } from "bun:test";
import {
	calculateContrast,
	clearLuminanceCache,
	getRelativeLuminance,
	getWCAGCompliance,
	meetsWCAG,
} from "../src/contrast";

describe("Luminance Cache", () => {
	beforeEach(() => {
		clearLuminanceCache();
	});

	test("caches computed luminance values", () => {
		const hex = "#3B82F6";
		const first = getRelativeLuminance(hex);
		const second = getRelativeLuminance(hex);
		expect(first).toBe(second);
	});

	test("clearLuminanceCache clears the cache", () => {
		const hex = "#FF0000";
		getRelativeLuminance(hex);
		clearLuminanceCache();
		// After clearing, should still compute correct value
		const result = getRelativeLuminance(hex);
		expect(result).toBeGreaterThan(0);
	});

	test("normalized keys work - uppercase and lowercase produce same result", () => {
		const upper = getRelativeLuminance("#FFFFFF");
		clearLuminanceCache();
		const lower = getRelativeLuminance("#ffffff");
		expect(upper).toBe(lower);
	});

	test("normalized keys work - shorthand and full hex produce same result", () => {
		const full = getRelativeLuminance("#FF0000");
		clearLuminanceCache();
		const short = getRelativeLuminance("#F00");
		expect(full).toBe(short);
	});

	test("whitespace is trimmed for cache keys", () => {
		const trimmed = getRelativeLuminance("#000000");
		clearLuminanceCache();
		const withSpace = getRelativeLuminance("  #000000  ");
		expect(trimmed).toBe(withSpace);
	});
});

describe("Contrast Calculation", () => {
	test("should calculate correct contrast ratio for black and white", () => {
		const ratio = calculateContrast("#000000", "#FFFFFF");
		expect(Math.abs(ratio - 21)).toBeLessThan(0.5);
	});

	test("should calculate correct contrast ratio for same colors", () => {
		const ratio = calculateContrast("#FFFFFF", "#FFFFFF");
		expect(Math.abs(ratio - 1)).toBeLessThan(0.5);
	});

	test("should calculate contrast for blue on white", () => {
		const ratio = calculateContrast("#0000FF", "#FFFFFF");
		expect(ratio).toBeGreaterThan(3);
		expect(ratio).toBeLessThan(9);
	});

	test("should validate WCAG AA for normal text", () => {
		expect(meetsWCAG(4.5, "AA", "normal")).toBe(true);
		expect(meetsWCAG(4.4, "AA", "normal")).toBe(false);
	});

	test("should validate WCAG AAA for normal text", () => {
		expect(meetsWCAG(7.0, "AAA", "normal")).toBe(true);
		expect(meetsWCAG(6.9, "AAA", "normal")).toBe(false);
	});

	test("should validate WCAG AA for large text", () => {
		expect(meetsWCAG(3.0, "AA", "large")).toBe(true);
		expect(meetsWCAG(2.9, "AA", "large")).toBe(false);
	});

	test("should return correct compliance levels", () => {
		const compliance = getWCAGCompliance(7.5, "normal");
		expect(compliance.AA).toBe(true);
		expect(compliance.AAA).toBe(true);
		expect(compliance.level).toBe("AAA");
	});

	test("should return fail for insufficient contrast", () => {
		const compliance = getWCAGCompliance(3.0, "normal");
		expect(compliance.AA).toBe(false);
		expect(compliance.AAA).toBe(false);
		expect(compliance.level).toBe("fail");
	});
});

describe("WCAG Threshold Precision", () => {
	describe("AA Normal Text (4.5:1)", () => {
		test("exactly 4.5 passes", () => {
			expect(meetsWCAG(4.5, "AA", "normal")).toBe(true);
		});

		test("4.499 fails", () => {
			expect(meetsWCAG(4.499, "AA", "normal")).toBe(false);
		});

		test("4.501 passes", () => {
			expect(meetsWCAG(4.501, "AA", "normal")).toBe(true);
		});
	});

	describe("AA Large Text (3.0:1)", () => {
		test("exactly 3.0 passes", () => {
			expect(meetsWCAG(3.0, "AA", "large")).toBe(true);
		});

		test("2.999 fails", () => {
			expect(meetsWCAG(2.999, "AA", "large")).toBe(false);
		});

		test("3.001 passes", () => {
			expect(meetsWCAG(3.001, "AA", "large")).toBe(true);
		});
	});

	describe("AAA Normal Text (7.0:1)", () => {
		test("exactly 7.0 passes", () => {
			expect(meetsWCAG(7.0, "AAA", "normal")).toBe(true);
		});

		test("6.999 fails", () => {
			expect(meetsWCAG(6.999, "AAA", "normal")).toBe(false);
		});

		test("7.001 passes", () => {
			expect(meetsWCAG(7.001, "AAA", "normal")).toBe(true);
		});
	});

	describe("AAA Large Text (4.5:1)", () => {
		test("exactly 4.5 passes", () => {
			expect(meetsWCAG(4.5, "AAA", "large")).toBe(true);
		});

		test("4.499 fails", () => {
			expect(meetsWCAG(4.499, "AAA", "large")).toBe(false);
		});
	});
});

describe("Relative Luminance Precision", () => {
	test("black has luminance 0", () => {
		expect(getRelativeLuminance("#000000")).toBe(0);
	});

	test("white has luminance 1", () => {
		expect(getRelativeLuminance("#FFFFFF")).toBe(1);
	});

	test("mid-gray has luminance ~0.216 (sRGB linearization)", () => {
		const luminance = getRelativeLuminance("#808080");
		// 0.5^2.4 ≈ 0.216 for sRGB
		expect(luminance).toBeCloseTo(0.216, 2);
	});

	test("pure red luminance is ~0.2126 (R coefficient)", () => {
		const luminance = getRelativeLuminance("#FF0000");
		expect(luminance).toBeCloseTo(0.2126, 3);
	});

	test("pure green luminance is ~0.7152 (G coefficient)", () => {
		const luminance = getRelativeLuminance("#00FF00");
		expect(luminance).toBeCloseTo(0.7152, 3);
	});

	test("pure blue luminance is ~0.0722 (B coefficient)", () => {
		const luminance = getRelativeLuminance("#0000FF");
		expect(luminance).toBeCloseTo(0.0722, 3);
	});
});

describe("Contrast Ratio Edge Cases", () => {
	test("same color returns exactly 1", () => {
		expect(calculateContrast("#AABBCC", "#AABBCC")).toBe(1);
	});

	test("black on white returns exactly 21", () => {
		const ratio = calculateContrast("#000000", "#FFFFFF");
		expect(ratio).toBeCloseTo(21, 1);
	});

	test("order of arguments doesn't matter", () => {
		const ratio1 = calculateContrast("#000000", "#FFFFFF");
		const ratio2 = calculateContrast("#FFFFFF", "#000000");
		expect(ratio1).toBe(ratio2);
	});

	test("handles shorthand hex format", () => {
		const ratio = calculateContrast("#FFF", "#000");
		expect(ratio).toBeCloseTo(21, 1);
	});

	test("handles mixed case input", () => {
		const ratio1 = calculateContrast("#aabbcc", "#FFFFFF");
		const ratio2 = calculateContrast("#AABBCC", "#ffffff");
		expect(ratio1).toBe(ratio2);
	});
});

describe("getWCAGCompliance Edge Cases", () => {
	test("ratio at exact AA threshold", () => {
		const compliance = getWCAGCompliance(4.5, "normal");
		expect(compliance.AA).toBe(true);
		expect(compliance.AAA).toBe(false);
		expect(compliance.level).toBe("AA");
	});

	test("ratio at exact AAA threshold", () => {
		const compliance = getWCAGCompliance(7.0, "normal");
		expect(compliance.AA).toBe(true);
		expect(compliance.AAA).toBe(true);
		expect(compliance.level).toBe("AAA");
	});

	test("large text has lower thresholds", () => {
		const compliance = getWCAGCompliance(3.0, "large");
		expect(compliance.AA).toBe(true);
		expect(compliance.level).toBe("AA");
	});

	test("returns ratio in result", () => {
		const compliance = getWCAGCompliance(5.5, "normal");
		expect(compliance.ratio).toBe(5.5);
	});
});
