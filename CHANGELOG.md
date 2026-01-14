# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [bdsg 0.2.0] - 2026-01-14

### Added

- **OKLCH Color Space**: New perceptually uniform color space support
  - `hexToOklch()` - Convert HEX to OKLCH (L: 0-1, C: 0+, H: 0-360)
  - `oklchToHex()` - Convert OKLCH back to HEX
  - `interpolateOklch()` - Smooth color interpolation without "muddy middle"
- **Gradient Generation**: New `gradients.ts` module with expandable architecture
  - `generateGradient()` - Two-color gradient with OKLCH interpolation
  - `generateMultiStopGradient()` - Multi-stop gradients with position control
  - `toCssGradient()` - Generate CSS linear/radial/conic gradient strings
  - `EASING` presets - `linear`, `easeIn`, `easeOut`, `easeInOut`
  - Hue direction control: `shorter`, `longer`, `increasing`, `decreasing`
- **OKLCH Types**: New `oklch.types.ts` with `OKLCH` interface

### Changed

- **Palette Generation**: Refactored `generatePalette()` to use OKLCH instead of HSL for perceptually uniform shade generation
- **Centralized Validation**: Created `schemas.ts` with shared Zod schemas
  - `HexColorSchema`, `OklchSchema`, `RgbSchema`, `HslSchema`
  - `GradientStopSchema`, `GradientConfigSchema`, `StepsSchema`
  - `validateOrThrow()` helper function for cleaner validation code
- **Code Quality**: All modules now use centralized validation schemas

### Tests

- Added 14 new tests for OKLCH conversions (`oklch.test.ts`)
- Added 22 new tests for gradients (`gradients.test.ts`)
- Total: 284 tests across 11 files

[bdsg 0.2.0]: https://github.com/CarlosEduJs/bdsg/releases/tag/bdsg@v0.2.0

## [bdsg-cli 0.1.2] - 2026-01-12

### Fixed

- **Dependencies**: Updated `bdsg` dependency to `^0.1.3` to fix installation errors outside the monorepo. Users can now install `bdsg-cli` globally without workspace resolution issues.

[bdsg-cli 0.1.2]: https://github.com/CarlosEduJs/bdsg/releases/tag/bdsg-cli@v0.1.2

## [bdsg 0.1.3] - 2026-01-12

### Fixed

- **ESM Build**: Switched from `tsc` to `tsup` for proper ESM bundling. The package now works correctly with Node.js ESM and in JavaScript files without import extension errors.

### Changed

- **Build Tool**: Replaced `tsc` with `tsup` for generating ESM bundle with proper module resolution
- **Bundle**: All source files are now bundled into a single `index.js` instead of separate files

[0.1.3]: https://github.com/CarlosEduJs/bdsg/releases/tag/bdsg@v0.1.3

## [bdsg-cli 0.1.1] - 2026-01-11

### Fixed

- **Dependencies**: Changed `bdsg` dependency from `workspace:*` to `^0.1.2` to fix installation errors outside the monorepo. Users can now install `bdsg-cli` globally without workspace resolution issues.

[bdsg-cli 0.1.1]: https://github.com/CarlosEduJs/bdsg/releases/tag/bdsg-cli@v0.1.1

## [bdsg-cli 0.1.0] - 2026-01-11

### Added

- **New Package**: `bdsg-cli` - Interactive CLI for design system generation
- **`bdsg init`**: Interactive setup with prompts for colors, typography, spacing, and shadows
- **`bdsg generate`**: Generate specific tokens individually
  - `generate palette <color>` - Generate color palette from hex
  - `generate typography` - Generate typography scale
  - `generate spacing` - Generate spacing scale
  - `generate shadows` - Generate shadow tokens
- **`bdsg validate`**: WCAG contrast analysis with auto-suggestions for accessibility compliance
- **Output Formats**:
  - CSS Variables
  - JSON Tokens
  - Tailwind v4 (`@theme` directive)
  - Shadcn/ui (with dark mode support)

[bdsg-cli 0.1.0]: https://github.com/CarlosEduJs/bdsg/releases/tag/bdsg-cli@v0.1.0

## [0.1.2] - 2026-01-10

### Changed

- **Type Organization**: All types are now in separate `.types.ts` files in folder `types`
  - `color-utils.types.ts` -> `RGB`, `HSL`
  - `contrast.types.ts` -> `WCAGLevel`, `TextSize`, `WCAGCompliance`
  - `adjust.types.ts` -> `AdjustmentResult`, `ColorVariations`
  - `palette.types.ts` -> `ColorShade`, `ColorPalette`, `PaletteToken`
  - `typography.types.ts` -> `TypographyRatio`, `TypographyToken`, `TypographyScaleConfig`, `TypographyScale`, `TypographyExportToken`
  - `spacing.types.ts` -> `SpacingMethod`, `SpacingToken`, `SpacingScaleConfig`, `SpacingScale`, `SpacingExportToken`
  - `shadows.types.ts` -> `ShadowLayer`, `ShadowToken`, `ShadowConfig`, `ShadowScale`, `ShadowExportToken`
  - `relations.types.ts` -> `Node`, `RelationSuggestion`
- **Backward Compatible**: All types are still exported from the main module files

[0.1.2]: https://github.com/carloseduj/bdsg/releases/tag/v0.1.2

## [0.1.1] - 2026-01-10

### Fixed

- **Links**: Fixed links in npm to GitHub repository

[0.1.1]: https://github.com/carloseduj/bdsg/releases/tag/v0.1.1

## [0.1.0] - 2026-01-10

### Added

- **Color Utilities**: HEX, RGB, and HSL color space conversions
- **Contrast Calculations**: WCAG 2.1 contrast ratio calculations with AA/AAA compliance checking
- **Color Adjustment**: Automatic color adjustment to meet WCAG requirements while preserving hue
- **Palette Generation**: 10-shade color palettes with automatic text color calculation
- **Typography Scale**: Modular typography scales using musical ratios (minor-second to golden-ratio)
- **Spacing Scale**: Multiple progression methods (Fibonacci, linear, exponential, t-shirt sizes)
- **Shadow Generation**: Elevation-based shadows with multiple styles (Material, soft, hard, inset, brutalist, neumorphism)
- **Relations Detection**: Heuristic-based token relationship detection via naming patterns
- **Input Validation**: All functions validated with Zod schemas
- **TypeScript Support**: Full type definitions included
- **248 Tests**: Comprehensive test coverage across all modules
- **Examples**: 6 practical examples demonstrating library usage
- **Documentation**: Complete API reference and usage guides

### Features

- Luminance caching for performance optimization
- Binary search algorithm for efficient color adjustment
- CSS variable generation for all token types
- Token export in flat array format
- Preset configurations for common design systems (Tailwind, Material, etc.)

[0.1.0]: https://github.com/carloseduj/bdsg/releases/tag/v0.1.0
