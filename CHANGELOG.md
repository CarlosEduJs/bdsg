# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
