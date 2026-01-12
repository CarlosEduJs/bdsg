# bdsg

[![npm version](https://img.shields.io/npm/v/bdsg.svg)](https://www.npmjs.com/package/bdsg)
[![CI](https://github.com/carloseduj/bdsg/actions/workflows/ci.yml/badge.svg)](https://github.com/carloseduj/bdsg/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

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

Interactive CLI for terminal-based design system generation. See [bdsg-cli](#bdsg-cli).

## Installation

### Library

```bash
bun add bdsg
```

### CLI

```bash
npm install -g bdsg-cli
# or
bun add -g bdsg-cli
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

## bdsg-cli

Interactive CLI for design system generation without leaving your terminal.

### Commands

```bash
# Interactive setup
bdsg init

# Generate specific tokens
bdsg generate palette "#3B82F6" -n primary
bdsg generate typography -r golden-ratio
bdsg generate spacing -m fibonacci
bdsg generate shadows -s material

# Validate WCAG contrast
bdsg validate "#3B82F6" "#FFFFFF"
```

### Output Formats

- **CSS Variables** - Standard CSS custom properties
- **JSON Tokens** - Structured token data
- **Tailwind v4** - `@theme` directive format
- **Shadcn/ui** - Complete `globals.css` with dark mode

Full documentation: [packages/bdsg-cli/README.md](./packages/bdsg-cli/README.md)

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
│   ├── bdsg/       # Core library
│   │   ├── src/    # Source
│   │   └── test/   # Tests (bun:test)
│   └── bdsg-cli/   # Interactive CLI
│       └── src/    # Commands (init, generate, validate)
```

## License

MIT
