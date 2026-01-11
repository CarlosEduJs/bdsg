# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
