/**
 * WCAG Compliance Example
 *
 * Check and automatically fix color contrast for accessibility.
 */

import {
	adjustColorForContrast,
	calculateContrast,
	generateAccessibleVariations,
	getWCAGCompliance,
} from "bdsg";

console.log(" Contrast Calculation \n");

const pairs: [string, string, string][] = [
	["#000000", "#FFFFFF", "Black on White"],
	["#3B82F6", "#FFFFFF", "Blue on White"],
	["#87CEEB", "#FFFFFF", "Light Blue on White"],
	["#FFFF00", "#FFFFFF", "Yellow on White"],
];

for (const [fg, bg, label] of pairs) {
	const ratio = calculateContrast(fg, bg);
	const compliance = getWCAGCompliance(ratio, "normal");
	console.log(`${label}:`);
	console.log(`  Ratio: ${ratio.toFixed(2)}:1`);
	console.log(
		`  AA: ${compliance.AA ? "PASS" : "FAIL"}, AAA: ${compliance.AAA ? "PASS" : "FAIL"}`,
	);
	console.log();
}

console.log(" Auto-Adjustment \n");

// Fix light blue to meet AA
const result = adjustColorForContrast("#87CEEB", "#FFFFFF", "AA", "normal");
console.log("Light Blue Adjustment:");
console.log(`  Original: ${result.original}`);
console.log(`  Adjusted: ${result.adjusted}`);
console.log(`  Ratio: ${result.ratio.toFixed(2)}:1`);
console.log(`  Strategy: ${result.strategy}`);
console.log(`  Iterations: ${result.iterations}`);

console.log("\n Accessible Variations \n");

// Generate accessible color set from brand color
const variations = generateAccessibleVariations("#3B82F6", "#FFFFFF");
console.log("Blue variations on white background:");
console.log(`  Base: ${variations.base}`);
console.log(`  Light: ${variations.light}`);
console.log(`  Dark: ${variations.dark}`);
console.log(`  Text: ${variations.text}`);
