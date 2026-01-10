/**
 * Color Palette Generation Example
 *
 * Generate a complete 10-shade color palette from a single base color.
 * Each shade includes optimal text color for accessibility.
 */

import { generatePalette, generatePaletteTokens } from "bdsg";

// Generate palette from brand color
const palette = generatePalette("#3B82F6", "primary");

console.log(" Color Palette \n");
console.log(`Base: ${palette.base}`);
console.log(`Name: ${palette.name}\n`);

console.log("Shades:");
for (const [shade, data] of Object.entries(palette.shades)) {
	console.log(
		`  ${shade}: ${data.value} (text: ${data.textColor}, contrast: ${data.contrastRatio.toFixed(1)}:1)`,
	);
}

// Export as design tokens
console.log("\n As Tokens \n");
const tokens = generatePaletteTokens("#10B981", "success");
for (const token of tokens.slice(0, 3)) {
	console.log(`${token.name}: ${token.value}`);
}
console.log("...");
