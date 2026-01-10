/**
 * Complete Design Tokens Example
 *
 * Generate a full design token system and export as CSS variables.
 */

import {
	generatePalette,
	generateShadows,
	generateSpacingScale,
	generateTypographyScale,
	SHADOW_PRESETS,
	SPACING_PRESETS,
} from "bdsg";

// Brand colors
const colors = {
	primary: generatePalette("#3B82F6", "primary"),
	secondary: generatePalette("#8B5CF6", "secondary"),
	success: generatePalette("#10B981", "success"),
	warning: generatePalette("#F59E0B", "warning"),
	error: generatePalette("#EF4444", "error"),
	neutral: generatePalette("#6B7280", "neutral"),
};

// Typography
const typography = generateTypographyScale({
	base: 16,
	ratio: "perfect-fourth",
	stepsUp: 6,
	stepsDown: 2,
	unit: "rem",
});

// Spacing
const spacing = generateSpacingScale({
	...SPACING_PRESETS.tailwind,
	steps: 12,
});

// Shadows
const shadows = generateShadows(SHADOW_PRESETS.material);

// Generate CSS
let css = ":root {\n";

// Color tokens
css += "  /* Colors */\n";
for (const [name, palette] of Object.entries(colors)) {
	for (const [shade, data] of Object.entries(palette.shades)) {
		css += `  --${name}-${shade}: ${data.value};\n`;
	}
}

// Typography tokens
css += "\n  /* Typography */\n";
for (const token of typography.tokens) {
	css += `  --font-size-${token.name}: ${token.fontSize / 16}rem;\n`;
	css += `  --line-height-${token.name}: ${token.lineHeight};\n`;
}

// Spacing tokens
css += "\n  /* Spacing */\n";
for (const token of spacing.tokens) {
	css += `  --space-${token.name}: ${token.formatted};\n`;
}

// Shadow tokens
css += "\n  /* Shadows */\n";
for (const token of shadows.tokens) {
	css += `  --shadow-${token.name}: ${token.value};\n`;
}

css += "}\n";

console.log(" Complete Design Tokens \n");
console.log(css);

// Summary
console.log(" Summary \n");
console.log(
	`Colors: ${Object.keys(colors).length} palettes x 10 shades = ${Object.keys(colors).length * 10} tokens`,
);
console.log(`Typography: ${typography.tokens.length} sizes`);
console.log(`Spacing: ${spacing.tokens.length} values`);
console.log(`Shadows: ${shadows.tokens.length} levels`);
