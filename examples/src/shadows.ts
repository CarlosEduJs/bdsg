/**
 * Shadow Generation Example
 *
 * Generate elevation-based shadows in different styles.
 */

import { generateShadows, SHADOW_PRESETS } from "bdsg";

// Material Design shadows (3-layer realistic)
const material = generateShadows({
	...SHADOW_PRESETS.material,
	levels: 5,
});

console.log(" Material Shadows \n");
for (const token of material.tokens) {
	console.log(`${token.name}:`);
	console.log(`  Elevation: ${token.elevation}`);
	console.log(`  Layers: ${token.layers.length}`);
	console.log(`  Value: ${token.value.slice(0, 60)}...`);
	console.log();
}

// Soft shadows (diffuse, modern)
const soft = generateShadows(SHADOW_PRESETS.soft);

console.log(" Soft Shadows \n");
for (const token of soft.tokens.slice(0, 3)) {
	console.log(`${token.name}: ${token.value}`);
}
console.log("...\n");

// Brutalist (hard edges)
const brutalist = generateShadows(SHADOW_PRESETS.brutalist);

console.log(" Brutalist Shadows \n");
for (const token of brutalist.tokens.slice(0, 3)) {
	console.log(`${token.name}: ${token.value}`);
}
console.log("...\n");

// CSS Variables
console.log(" CSS Variables \n");
console.log(material.cssVariables);
