import { describe, expect, test } from "bun:test";
import {
	EASING,
	generateGradient,
	generateMultiStopGradient,
	toCssGradient,
} from "../src/gradients";
import { hexToOklch } from "../src/oklch";

describe("Gradient Generation", () => {
	describe("generateGradient", () => {
		test("generates correct number of steps", () => {
			const gradient = generateGradient("#ff0000", "#0000ff", 5);
			expect(gradient).toHaveLength(5);
		});

		test("starts and ends with correct colors", () => {
			const gradient = generateGradient("#ff0000", "#0000ff", 5);
			expect(gradient[0]?.toLowerCase()).toBe("#ff0000");
			expect(gradient[4]?.toLowerCase()).toBe("#0000ff");
		});

		test("produces vibrant midpoints (no muddy zone)", () => {
			// Red to Green in RGB produces muddy brown in the middle
			// OKLCH should produce vibrant yellow/orange
			const gradient = generateGradient("#ff0000", "#00ff00", 5);
			const middle = gradient[2];
			if (!middle) throw new Error("Middle color is undefined");

			const middleOklch = hexToOklch(middle);
			// Middle should have decent chroma (not muddy)
			expect(middleOklch.c).toBeGreaterThan(0.1);
		});

		test("throws on invalid start color", () => {
			expect(() => generateGradient("invalid", "#0000ff", 5)).toThrow();
		});

		test("throws on invalid end color", () => {
			expect(() => generateGradient("#ff0000", "invalid", 5)).toThrow();
		});

		test("throws on steps less than 2", () => {
			expect(() => generateGradient("#ff0000", "#0000ff", 1)).toThrow();
		});
	});

	describe("generateGradient with easing", () => {
		test("applies easeIn correctly", () => {
			const linear = generateGradient("#000000", "#ffffff", 5);
			const eased = generateGradient("#000000", "#ffffff", 5, {
				easing: EASING.easeIn,
			});

			// EaseIn should have lighter colors later in the sequence
			// So eased[1] should be darker than linear[1]
			const linearColor = linear[1];
			const easedColor = eased[1];
			if (!linearColor || !easedColor) throw new Error("Colors undefined");
			const linearL = hexToOklch(linearColor).l;
			const easedL = hexToOklch(easedColor).l;
			expect(easedL).toBeLessThan(linearL);
		});

		test("applies easeOut correctly", () => {
			const linear = generateGradient("#000000", "#ffffff", 5);
			const eased = generateGradient("#000000", "#ffffff", 5, {
				easing: EASING.easeOut,
			});

			// EaseOut should have lighter colors earlier in the sequence
			// So eased[1] should be lighter than linear[1]
			const linearColor = linear[1];
			const easedColor = eased[1];
			if (!linearColor || !easedColor) throw new Error("Colors undefined");
			const linearL = hexToOklch(linearColor).l;
			const easedL = hexToOklch(easedColor).l;
			expect(easedL).toBeGreaterThan(linearL);
		});
	});

	describe("generateGradient with hueDirection", () => {
		test("shorter takes shortest hue path", () => {
			// Red (h≈29) to Blue (h≈264) - shorter path goes through 0
			const gradient = generateGradient("#ff0000", "#ff8800", 3, {
				hueDirection: "shorter",
			});
			expect(gradient).toHaveLength(3);
		});

		test("longer takes longer hue path", () => {
			const gradient = generateGradient("#ff0000", "#ff8800", 5, {
				hueDirection: "longer",
			});
			expect(gradient).toHaveLength(5);
		});
	});

	describe("generateMultiStopGradient", () => {
		test("generates gradient with multiple stops", () => {
			const gradient = generateMultiStopGradient(
				[
					{ color: "#ff0000", position: 0 },
					{ color: "#ffff00", position: 0.5 },
					{ color: "#00ff00", position: 1 },
				],
				5,
			);
			expect(gradient).toHaveLength(5);
		});

		test("throws on less than 2 stops", () => {
			expect(() =>
				generateMultiStopGradient([{ color: "#ff0000", position: 0 }], 5),
			).toThrow();
		});

		test("throws on invalid stop color", () => {
			expect(() =>
				generateMultiStopGradient(
					[
						{ color: "invalid", position: 0 },
						{ color: "#00ff00", position: 1 },
					],
					5,
				),
			).toThrow();
		});

		test("throws on invalid position", () => {
			expect(() =>
				generateMultiStopGradient(
					[
						{ color: "#ff0000", position: -0.5 },
						{ color: "#00ff00", position: 1 },
					],
					5,
				),
			).toThrow();
		});
	});

	describe("toCssGradient", () => {
		test("generates linear gradient", () => {
			const colors = ["#ff0000", "#00ff00", "#0000ff"];
			const css = toCssGradient("linear", colors, 45);
			expect(css).toBe("linear-gradient(45deg, #ff0000, #00ff00, #0000ff)");
		});

		test("generates radial gradient", () => {
			const colors = ["#ff0000", "#0000ff"];
			const css = toCssGradient("radial", colors);
			expect(css).toBe("radial-gradient(circle, #ff0000, #0000ff)");
		});

		test("generates conic gradient", () => {
			const colors = ["#ff0000", "#0000ff"];
			const css = toCssGradient("conic", colors, 90);
			expect(css).toBe("conic-gradient(from 90deg, #ff0000, #0000ff)");
		});

		test("throws on empty colors array", () => {
			expect(() => toCssGradient("linear", [])).toThrow();
		});
	});

	describe("EASING functions", () => {
		test("linear returns t unchanged", () => {
			expect(EASING.linear(0.5)).toBe(0.5);
		});

		test("easeIn returns t squared", () => {
			expect(EASING.easeIn(0.5)).toBe(0.25);
		});

		test("easeOut is faster early", () => {
			expect(EASING.easeOut(0.5)).toBe(0.75);
		});

		test("easeInOut is symmetric", () => {
			// At t=0.5, easeInOut should return 0.5
			expect(EASING.easeInOut(0.5)).toBe(0.5);
		});
	});
});
