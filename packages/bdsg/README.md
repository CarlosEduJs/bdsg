# bdsg

[![npm version](https://img.shields.io/npm/v/bdsg.svg)](https://www.npmjs.com/package/bdsg)
[![CI](https://github.com/carlosedujs/bdsg/actions/workflows/ci.yml/badge.svg)](https://github.com/carloseduj/bdsg/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Design System Generation library. Algorithms for generating design tokens programmatically with WCAG accessibility compliance.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
  - [Color Utilities](#color-utilities)
  - [Contrast](#contrast)
  - [Color Adjustment](#color-adjustment)
  - [Palette Generation](#palette-generation)
  - [Typography Scale](#typography-scale)
  - [Spacing Scale](#spacing-scale)
  - [Shadow Generation](#shadow-generation)
  - [Relations Detection](#relations-detection)
- [Validation](#validation)
- [License](#license)

## Installation

```bash
bun add bdsg
# or
npm install bdsg
```

## Quick Start

```typescript
import {
  generatePalette,
  generateTypographyScale,
  generateSpacingScale,
  generateShadows,
  adjustColorForContrast,
} from "bdsg";

// Generate a color palette from a base color
const palette = generatePalette("#3B82F6", "primary");
console.log(palette.shades[500].value);      // "#3B82F6"
console.log(palette.shades[500].textColor);  // "#FFFFFF"

// Adjust a color to meet WCAG AA contrast requirements
const result = adjustColorForContrast("#87CEEB", "#FFFFFF", "AA");
console.log(result.adjusted);  // Darker blue that meets 4.5:1 ratio
console.log(result.ratio);     // 4.52

// Generate typography scale using perfect-fourth ratio
const typography = generateTypographyScale({
  base: 16,
  ratio: "perfect-fourth",
  stepsUp: 4,
  stepsDown: 2,
});
console.log(typography.tokens);
// [{ name: "xs", fontSize: 9, lineHeight: 1.7, ... }, ...]

// Generate spacing scale with Fibonacci progression
const spacing = generateSpacingScale({ base: 8, method: "fibonacci" });
console.log(spacing.tokens.map(t => t.formatted));
// ["0", "0.25rem", "0.5rem", "0.75rem", "1rem", ...]

// Generate Material Design-style shadows
const shadows = generateShadows({ style: "material", levels: 5 });
console.log(shadows.cssVariables);
// "--shadow-none: none;\n--shadow-sm: 0px 1px 2px..."
```

## API Reference

### Color Utilities

Convert colors between hex, RGB, and HSL color spaces.

```typescript
import { hexToRgb, rgbToHex, hexToHsl, hslToHex } from "bdsg";

hexToRgb("#FF5733");           // { r: 255, g: 87, b: 51 }
hexToRgb("#F00");              // { r: 255, g: 0, b: 0 } (shorthand supported)
rgbToHex({ r: 0, g: 128, b: 255 });  // "#0080ff"
hexToHsl("#3B82F6");           // { h: 217, s: 91, l: 60 }
hslToHex({ h: 0, s: 100, l: 50 });   // "#ff0000"
```

### Contrast

Calculate and validate WCAG 2.1 contrast ratios.

```typescript
import {
  calculateContrast,
  getRelativeLuminance,
  meetsWCAG,
  getWCAGCompliance,
} from "bdsg";

// Calculate contrast ratio (1:1 to 21:1)
calculateContrast("#000000", "#FFFFFF");  // 21
calculateContrast("#767676", "#FFFFFF");  // 4.54

// Check WCAG compliance
meetsWCAG(4.5, "AA", "normal");   // true
meetsWCAG(4.5, "AAA", "normal");  // false (AAA requires 7.0)
meetsWCAG(3.0, "AA", "large");    // true (large text only needs 3.0)

// Get full compliance info
getWCAGCompliance(4.5, "normal");
// { ratio: 4.5, AA: true, AAA: false, level: "AA" }
```

WCAG Requirements:
| Level | Normal Text | Large Text |
|-------|-------------|------------|
| AA    | 4.5:1       | 3.0:1      |
| AAA   | 7.0:1       | 4.5:1      |

### Color Adjustment

Automatically adjust colors to meet accessibility requirements.

```typescript
import { adjustColorForContrast, generateAccessibleVariations } from "bdsg";

// Adjust color to meet WCAG AA on white background
const result = adjustColorForContrast("#87CEEB", "#FFFFFF", "AA", "normal");
// {
//   original: "#87CEEB",
//   adjusted: "#1A6B8A",  // Darkened to meet contrast
//   ratio: 4.52,
//   iterations: 8,
//   strategy: "lightness"
// }

// Generate accessible color variations
const variations = generateAccessibleVariations("#3B82F6", "#FFFFFF");
// {
//   base: "#2563EB",   // Adjusted base
//   light: "#60A5FA",  // Lighter variant
//   dark: "#1E40AF",   // Darker variant
//   text: "#FFFFFF"    // Best text color on base
// }
```

The algorithm:
1. Preserves hue (brand identity)
2. Adjusts lightness first (binary search)
3. Reduces saturation if needed
4. Falls back to black/white if impossible

### Palette Generation

Generate 10-shade color palettes from a base color.

```typescript
import { generatePalette, generatePaletteTokens } from "bdsg";

const palette = generatePalette("#3B82F6", "primary");

// Each shade includes value, text color, and contrast ratio
palette.shades[100];
// { value: "#DBEAFE", textColor: "#000000", contrastRatio: 17.4 }

palette.shades[900];
// { value: "#1E3A8A", textColor: "#FFFFFF", contrastRatio: 10.2 }

// Export as flat tokens
const tokens = generatePaletteTokens("#3B82F6", "primary");
// [
//   { name: "primary-50", value: "#EFF6FF", textColor: "#000000", ... },
//   { name: "primary-100", value: "#DBEAFE", ... },
//   ...
// ]
```

Shade lightness targets:
| Shade | Lightness |
|-------|-----------|
| 50    | 97%       |
| 100   | 93%       |
| 200   | 85%       |
| 300   | 75%       |
| 400   | 60%       |
| 500   | 50% (base)|
| 600   | 42%       |
| 700   | 35%       |
| 800   | 27%       |
| 900   | 20%       |

### Typography Scale

Generate font sizes using musical ratio progressions.

```typescript
import { generateTypographyScale, TYPOGRAPHY_RATIOS } from "bdsg";

const scale = generateTypographyScale({
  base: 16,                    // Base font size in px
  ratio: "perfect-fourth",     // 1.333 ratio
  stepsUp: 6,                  // Sizes above base
  stepsDown: 2,                // Sizes below base
  baseLineHeight: 1.5,         // Line height for base
  unit: "rem",                 // Output unit
});

// Each token includes calculated line-height and letter-spacing
scale.tokens[0];
// {
//   name: "xs",
//   fontSize: 9,
//   lineHeight: 1.7,      // Looser for small text
//   letterSpacing: 0.02,  // Positive tracking
//   weight: 400
// }

scale.tokens[scale.tokens.length - 1];
// {
//   name: "4xl",
//   fontSize: 50,
//   lineHeight: 1.1,      // Tighter for display
//   letterSpacing: -0.02, // Negative tracking
//   weight: 700
// }

// Available ratios
TYPOGRAPHY_RATIOS["minor-second"];    // 1.067
TYPOGRAPHY_RATIOS["major-second"];    // 1.125
TYPOGRAPHY_RATIOS["minor-third"];     // 1.2
TYPOGRAPHY_RATIOS["major-third"];     // 1.25
TYPOGRAPHY_RATIOS["perfect-fourth"];  // 1.333
TYPOGRAPHY_RATIOS["augmented-fourth"]; // 1.414 (sqrt(2))
TYPOGRAPHY_RATIOS["perfect-fifth"];   // 1.5
TYPOGRAPHY_RATIOS["golden-ratio"];    // 1.618
```

### Spacing Scale

Generate spacing values using mathematical progressions.

```typescript
import { generateSpacingScale, SPACING_PRESETS } from "bdsg";

// Fibonacci progression (organic, natural feel)
const fibonacci = generateSpacingScale({
  base: 8,
  method: "fibonacci",
  steps: 10,
});
// Values: [0, 4, 8, 12, 16, 28, 44, 72, 116, 188]

// Linear progression (consistent increments)
const linear = generateSpacingScale({
  base: 4,
  method: "linear",
  steps: 8,
});
// Values: [0, 4, 8, 12, 16, 20, 24, 28]

// Exponential progression (dramatic hierarchy)
const exponential = generateSpacingScale({
  base: 4,
  method: "exponential",
  exponent: 2,
  steps: 6,
});
// Values: [0, 4, 8, 16, 32, 64]

// T-shirt sizes (semantic naming)
const tshirt = generateSpacingScale({
  base: 8,
  method: "t-shirt",
  steps: 8,
});
// Names: 3xs, 2xs, xs, sm, md, lg, xl, 2xl

// Presets
generateSpacingScale(SPACING_PRESETS.tailwind);   // 4px linear
generateSpacingScale(SPACING_PRESETS.material);   // 8px linear
generateSpacingScale(SPACING_PRESETS.natural);    // 8px fibonacci
generateSpacingScale(SPACING_PRESETS.semantic);   // 8px t-shirt
```

### Shadow Generation

Generate layered shadows based on Material Design elevation.

```typescript
import { generateShadows, SHADOW_PRESETS } from "bdsg";

const shadows = generateShadows({
  color: "#000000",
  baseOpacity: 0.1,
  levels: 6,
  style: "material",  // material | soft | hard | inset
  layered: true,
});

// Token structure
shadows.tokens[2];
// {
//   name: "md",
//   level: 2,
//   layers: [
//     { x: 0, y: 3, blur: 6, spread: 0, opacity: 0.12 },
//     { x: 0, y: 2, blur: 4, spread: -1, opacity: 0.1 },
//     { x: 0, y: 1, blur: 2, spread: 0, opacity: 0.06 }
//   ],
//   value: "0px 3px 6px 0px rgba(0,0,0,0.12), ..."
// }

// CSS variables output
shadows.cssVariables;
// "--shadow-none: none;
// --shadow-sm: 0px 1px 2px 0px rgba(0,0,0,0.08), ...
// --shadow-md: ..."

// Presets
generateShadows(SHADOW_PRESETS.material);     // 3-layer realistic
generateShadows(SHADOW_PRESETS.soft);         // High blur, single layer
generateShadows(SHADOW_PRESETS.brutalist);    // Hard edges, no blur
generateShadows(SHADOW_PRESETS.neumorphism);  // Inset + outer
```

Shadow styles:
- **material**: Three layers (umbra, penumbra, ambient) for realistic depth
- **soft**: Single layer with high blur for diffuse shadows
- **hard**: Minimal blur, high contrast for retro look
- **inset**: Inner shadows for pressed/recessed states

### Relations Detection

Auto-detect relationships between design tokens using naming patterns.

```typescript
import { detectRelations, wouldCreateDirectCycle } from "bdsg";

const existingNodes = [
  { id: "1", name: "primary", category: "color", type: "token", value: "#3B82F6" },
  { id: "2", name: "spacing-base", category: "spacing", type: "token", value: "8px" },
];

// Detect paired naming: "primary-text" uses "primary"
const newNode = { id: "3", name: "primary-text", category: "color", type: "token", value: "#FFF" };
detectRelations(newNode, existingNodes);
// [{
//   fromNodeId: "3",
//   toNodeId: "1",
//   type: "uses",
//   confidence: 0.9,
//   reason: 'Token "primary-text" uses "primary" (paired naming pattern)'
// }]

// Detect hierarchical: "spacing-sm" depends on "spacing-base"
detectRelations(
  { id: "4", name: "spacing-sm", category: "spacing", type: "token", value: "4px" },
  existingNodes
);
// [{ type: "depends_on", confidence: 0.7, ... }]

// Detect palette shades: "primary-500" uses "primary"
detectRelations(
  { id: "5", name: "primary-500", category: "color", type: "token", value: "#3B82F6" },
  existingNodes
);
// [{ type: "uses", confidence: 0.8, ... }]

// Prevent cycles
wouldCreateDirectCycle("node-1", "node-1");  // true
wouldCreateDirectCycle("node-1", "node-2");  // false
```

Detection patterns:
| Pattern | Suffixes | Relation Type | Confidence |
|---------|----------|---------------|------------|
| Paired naming | `-text`, `-bg`, `-border`, `-hover` | uses | 0.9 |
| Hierarchical | `-base`, `-default`, `-primary` | depends_on | 0.7 |
| Palette shades | `-50` to `-900` | uses | 0.8 |

## Validation

All generation functions validate input using Zod schemas. Invalid configurations throw descriptive errors:

```typescript
generateTypographyScale({ base: 4 });
// Error: Invalid typography config: Number must be greater than or equal to 8

generateSpacingScale({ steps: 50 });
// Error: Invalid spacing config: Number must be less than or equal to 20

generatePalette("invalid");
// Error: Invalid base color: "invalid". Invalid hex color. Expected format: #RRGGBB or #RGB
```

## License

MIT
