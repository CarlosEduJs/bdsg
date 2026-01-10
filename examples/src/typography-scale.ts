/**
 * Typography Scale Example
 *
 * Generate a modular typography scale using musical ratios.
 * Includes calculated line-height, letter-spacing, and weight suggestions.
 */

import { generateTypographyScale, TYPOGRAPHY_RATIOS } from "bdsg";

console.log(" Typography Ratios \n");
for (const [name, value] of Object.entries(TYPOGRAPHY_RATIOS)) {
	console.log(`  ${name}: ${value}`);
}

// Generate scale with perfect-fourth ratio
const scale = generateTypographyScale({
	base: 16,
	ratio: "perfect-fourth",
	stepsUp: 5,
	stepsDown: 2,
	baseLineHeight: 1.5,
	unit: "rem",
});

console.log("\n Typography Scale (perfect-fourth) \n");
console.log(`Base: ${scale.base}px`);
console.log(`Ratio: ${scale.ratio}\n`);

console.log("Tokens:");
for (const token of scale.tokens) {
	console.log(
		`  ${token.name.padEnd(6)} ${String(token.fontSize).padStart(5)}px  lh: ${token.lineHeight}  ls: ${token.letterSpacing}em  weight: ${token.weight}`,
	);
}

// CSS Variables output
console.log("\n CSS Variables \n");
console.log(`${scale.cssVariables.slice(0, 500)}...`);
