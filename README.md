# bdsg

Design System Generation library for programmatic token creation with WCAG accessibility compliance.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Modules](#modules)
- [Development](#development)
- [License](#license)

## Overview

bdsg provides algorithms for generating design tokens:

- Color palettes with automatic text color calculation
- Typography scales using musical ratios
- Spacing scales (Fibonacci, linear, exponential)
- Layered shadows (Material, soft, hard, inset)
- Contrast adjustment for WCAG AA/AAA compliance
- Token relationship detection via naming patterns

All inputs are validated with Zod schemas.

## Installation

```bash
bun add bdsg
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

// Color palette from base color
const palette = generatePalette("#3B82F6", "primary");
palette.shades[500].value;      // "#3B82F6"
palette.shades[500].textColor;  // "#FFFFFF"

// Adjust color for WCAG AA
const result = adjustColorForContrast("#87CEEB", "#FFFFFF", "AA");
result.adjusted;  // Darker variant meeting 4.5:1
result.ratio;     // 4.52

// Typography with perfect-fourth ratio
const typography = generateTypographyScale({
  base: 16,
  ratio: "perfect-fourth",
});

// Fibonacci spacing
const spacing = generateSpacingScale({
  base: 8,
  method: "fibonacci",
});

// Material shadows
const shadows = generateShadows({
  style: "material",
  levels: 5,
});
```

## Modules

| Module | Functions |
|--------|-----------|
| color-utils | `hexToRgb`, `rgbToHex`, `hexToHsl`, `hslToHex`, `rgbToHsl`, `hslToRgb` |
| contrast | `calculateContrast`, `getRelativeLuminance`, `meetsWCAG`, `getWCAGCompliance` |
| adjust | `adjustColorForContrast`, `generateAccessibleVariations` |
| palette | `generatePalette`, `generatePaletteTokens` |
| typography | `generateTypographyScale`, `generateTypographyTokens`, `TYPOGRAPHY_RATIOS` |
| spacing | `generateSpacingScale`, `generateSpacingTokens`, `SPACING_PRESETS` |
| shadows | `generateShadows`, `generateShadowTokens`, `SHADOW_PRESETS` |
| relations | `detectRelations`, `wouldCreateDirectCycle` |

Full documentation: [packages/bdsg/README.md](./packages/bdsg/README.md)

## Development

```bash
# Install
bun install

# Test
cd packages/bdsg && bun test

# Build
bun run build

# Lint
bun run check
```

## Project Structure

```
bdsg/
├── packages/
│   └── bdsg/       # Core library
│       ├── src/    # Source
│       └── test/   # Tests (bun:test)
```

## License

MIT
