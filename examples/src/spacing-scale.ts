/**
 * Spacing Scale Example
 *
 * Generate spacing values using different mathematical progressions.
 */

import { generateSpacingScale, SPACING_PRESETS } from "bdsg";

// Fibonacci (organic, natural)
const fibonacci = generateSpacingScale({
	base: 8,
	method: "fibonacci",
	steps: 10,
	unit: "rem",
});

console.log(" Fibonacci Spacing \n");
for (const token of fibonacci.tokens) {
	console.log(
		`  ${token.name.padEnd(4)} ${String(token.value).padStart(3)}px  ${token.formatted}`,
	);
}

// Linear (consistent increments)
const linear = generateSpacingScale({
	base: 4,
	method: "linear",
	steps: 8,
	unit: "px",
});

console.log("\n Linear Spacing (4px grid) \n");
for (const token of linear.tokens) {
	console.log(`  ${token.name.padEnd(4)} ${token.formatted}`);
}

// T-shirt sizes (semantic)
const tshirt = generateSpacingScale(SPACING_PRESETS.semantic);

console.log("\n Semantic Spacing (T-shirt) \n");
for (const token of tshirt.tokens) {
	console.log(`  ${token.name.padEnd(4)} ${token.formatted}`);
}

// CSS output
console.log("\n CSS Variables \n");
console.log(fibonacci.cssVariables);
