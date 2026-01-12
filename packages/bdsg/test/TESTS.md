# Test Documentation: bdsg

This document is auto-generated from the test files. Do not edit manually.

Generated: 2026-01-12

## Overview

| Metric | Value |
|--------|-------|
| Total Tests | 263 |
| Test Files | 10 |

---

## Test Structure

```
test/
  adjust.test.ts  # Adjust (20 tests)
  color-utils.test.ts  # Color Utils (34 tests)
  contrast.test.ts  # Contrast (39 tests)
  index.test.ts  # Index (33 tests)
  oklch.test.ts  # Oklch (14 tests)
  palette.test.ts  # Palette (22 tests)
  relations.test.ts  # Relations (16 tests)
  shadows.test.ts  # Shadows (26 tests)
  spacing.test.ts  # Spacing (30 tests)
  typography.test.ts  # Typography (29 tests)
```

---

## Test Summary by Module

| Module | File | Tests | Suites |
|--------|------|-------|--------|
| Adjust | `adjust.test.ts` | 20 | 3 |
| Color Utils | `color-utils.test.ts` | 34 | 2 |
| Contrast | `contrast.test.ts` | 39 | 6 |
| Index | `index.test.ts` | 33 | 1 |
| Oklch | `oklch.test.ts` | 14 | 1 |
| Palette | `palette.test.ts` | 22 | 4 |
| Relations | `relations.test.ts` | 16 | 1 |
| Shadows | `shadows.test.ts` | 26 | 4 |
| Spacing | `spacing.test.ts` | 30 | 7 |
| Typography | `typography.test.ts` | 29 | 5 |

---

## Adjust

**File:** `test/adjust.test.ts`

**Total Tests:** 20

### Test Suites

| Suite | Tests | Description |
|-------|-------|-------------|
| Color Adjustment | 7 | Accessibility color adjustments |
| Color Adjustment Edge Cases | 9 | Boundary conditions |
| generateAccessibleVariations Edge Cases | 4 | Variation generation |

### Test Cases

#### Color Adjustment

- should adjust light blue to meet WCAG AA
- should preserve hue when adjusting
- should darken light colors on white background
- should lighten dark colors on dark background
- should meet AAA when requested
- should generate accessible variations
- should maintain visual identity (not turn gray)

#### Color Adjustment Edge Cases

- already accessible color returns unchanged with 0 iterations
- pure black on white background returns unchanged
- pure white on black background returns unchanged
- gray on gray (worst case) uses fallback
- reports correct iteration count for adjustments
- handles shorthand hex input (#FFF)
- handles lowercase hex input
- large text requires lower contrast (3.0)
- chroma strategy activates when lightness maxes out

#### generateAccessibleVariations Edge Cases

- works with grayscale input
- light and dark variants are distinct from each other
- works with very dark base color
- works with very light base color

---

## Color Utils

**File:** `test/color-utils.test.ts`

**Total Tests:** 34

### Test Suites

| Suite | Tests | Description |
|-------|-------|-------------|
| Color Utilities | 16 | HEX, RGB, HSL color conversions |
| Color Utilities Edge Cases | 18 | Test suite |

### Test Cases

#### Color Utilities

- should convert 6-digit hex to RGB
- should convert 3-digit hex to RGB (shorthand)
- should handle hex without # prefix
- should handle lowercase hex
- should throw error for invalid hex
- should handle hex with leading/trailing whitespace
- should convert RGB to hex
- should clamp values to valid range
- should pad single digit values with zero
- should convert white to HSL
- should convert black to HSL
- should convert red to HSL
- should convert HSL to RGB
- should handle grayscale (saturation 0)
- should preserve color through hex → HSL → hex
- should preserve color through RGB → HSL → RGB

#### Color Utilities Edge Cases

- throws for 4-character hex
- throws for 5-character hex
- throws for empty string
- throws for just hash
- throws for 7-character hex (too long)
- handles green primary color
- handles blue primary color
- handles mid-gray (all equal)
- handles near-black
- handles near-white
- handles hue at 360 (wraps to 0)
- handles hue > 360
- handles lightness 0 (black)
- handles lightness 100 (white)
- handles saturation 0 at various lightness
- hexToHsl works correctly
- hslToHex works correctly
- hexToHsl → hslToHex round trip

---

## Contrast

**File:** `test/contrast.test.ts`

**Total Tests:** 39

### Test Suites

| Suite | Tests | Description |
|-------|-------|-------------|
| Luminance Cache | 5 | Cache behavior and normalization |
| Contrast Calculation | 8 | WCAG contrast ratio calculations |
| WCAG Threshold Precision | 11 | Exact threshold boundary tests |
| Relative Luminance Precision | 6 | RGB coefficient accuracy |
| Contrast Ratio Edge Cases | 5 | Input format handling |
| getWCAGCompliance Edge Cases | 4 | Compliance level determination |

### Test Cases

#### Luminance Cache

- caches computed luminance values
- clearLuminanceCache clears the cache
- normalized keys work - uppercase and lowercase produce same result
- normalized keys work - shorthand and full hex produce same result
- whitespace is trimmed for cache keys

#### Contrast Calculation

- should calculate correct contrast ratio for black and white
- should calculate correct contrast ratio for same colors
- should calculate contrast for blue on white
- should validate WCAG AA for normal text
- should validate WCAG AAA for normal text
- should validate WCAG AA for large text
- should return correct compliance levels
- should return fail for insufficient contrast

#### WCAG Threshold Precision

- exactly 4.5 passes
- 4.499 fails
- 4.501 passes
- exactly 3.0 passes
- 2.999 fails
- 3.001 passes
- exactly 7.0 passes
- 6.999 fails
- 7.001 passes
- exactly 4.5 passes
- 4.499 fails

#### Relative Luminance Precision

- black has luminance 0
- white has luminance 1
- mid-gray has luminance ~0.216 (sRGB linearization)
- pure red luminance is ~0.2126 (R coefficient)
- pure green luminance is ~0.7152 (G coefficient)
- pure blue luminance is ~0.0722 (B coefficient)

#### Contrast Ratio Edge Cases

- same color returns exactly 1
- black on white returns exactly 21
- order of arguments doesn
- handles shorthand hex format
- handles mixed case input

#### getWCAGCompliance Edge Cases

- ratio at exact AA threshold
- ratio at exact AAA threshold
- large text has lower thresholds
- returns ratio in result

---

## Index

**File:** `test/index.test.ts`

**Total Tests:** 33

### Test Suites

| Suite | Tests | Description |
|-------|-------|-------------|
| Module Exports | 33 | Public API verification |

### Test Cases

#### Module Exports

- exports hexToRgb
- exports rgbToHex
- exports rgbToHsl
- exports hslToRgb
- exports hexToHsl
- exports hslToHex
- exports calculateContrast
- exports getRelativeLuminance
- exports meetsWCAG
- exports getWCAGCompliance
- exports clearLuminanceCache
- exports WCAG_REQUIREMENTS
- exports adjustColorForContrast
- exports generateAccessibleVariations
- exports generatePalette
- exports generatePaletteTokens
- exports detectRelations
- exports wouldCreateDirectCycle
- exports generateShadows
- exports generateShadowTokens
- exports SHADOW_PRESETS
- exports generateSpacingScale
- exports generateSpacingTokens
- exports SPACING_PRESETS
- exports generateTypographyScale
- exports generateTypographyTokens
- exports TYPOGRAPHY_RATIOS
- color utilities work end-to-end
- contrast calculation works
- palette generation works
- typography scale works
- spacing scale works
- shadow scale works

---

## Oklch

**File:** `test/oklch.test.ts`

**Total Tests:** 14

### Test Suites

| Suite | Tests | Description |
|-------|-------|-------------|
| OKLCH Color Space | 14 | Test suite |

### Test Cases

#### OKLCH Color Space

- converts white correctly
- converts black correctly
- converts pure red correctly
- converts pure blue correctly
- converts white correctly
- converts black correctly
- roundtrips colors accurately
- returns start color at t=0
- returns end color at t=1
- returns midpoint at t=0.5
- takes shortest hue path
- generates correct number of steps
- starts and ends with correct colors
- produces vibrant midpoints (no muddy zone)

---

## Palette

**File:** `test/palette.test.ts`

**Total Tests:** 22

### Test Suites

| Suite | Tests | Description |
|-------|-------|-------------|
| Palette Generation | 8 | 10-shade palette creation |
| Palette Tokens | 2 | Token array generation |
| Palette Edge Cases | 9 | Special color handling |
| Palette Token Generation | 2 | Token naming and ordering |

### Test Cases

#### Palette Generation

- should generate 10 shades from a base color
- should preserve base color at shade 500
- should generate lighter shades for 50-400
- should generate darker shades for 600-900
- should calculate text color for each shade
- should include contrast ratio for each shade
- should work with different base colors
- should set optional name

#### Palette Tokens

- should generate flat token array
- should include all required properties

#### Palette Edge Cases

- grayscale base color produces valid palette
- fully saturated red produces valid palette
- very dark base color works
- very light base color works
- shorthand hex input works
- lowercase hex input works
- throws for invalid hex
- contrast ratios are reasonable for all shades
- shade order is consistent (light to dark)

#### Palette Token Generation

- tokens are sorted by shade number
- token names use provided prefix

---

## Relations

**File:** `test/relations.test.ts`

**Total Tests:** 16

### Test Suites

| Suite | Tests | Description |
|-------|-------|-------------|
| Relations Detection | 16 | Token relationship detection |

### Test Cases

#### Relations Detection

- detects -text suffix (primary-text → primary)
- detects -bg suffix (primary-bg → primary)
- detects -border suffix
- detects -hover suffix
- does not detect false positive for non-paired naming
- detects -sm depending on -base (spacing-sm → spacing-base)
- does not match across different categories
- does not suggest for base tokens themselves
- detects shade 500 (primary-500 → primary)
- detects shade 100
- only matches color category
- returns empty array when no patterns match
- heuristic detection confidence is always < 1.0
- sorts relations by confidence descending
- returns true for self-reference
- returns false for different nodes

---

## Shadows

**File:** `test/shadows.test.ts`

**Total Tests:** 26

### Test Suites

| Suite | Tests | Description |
|-------|-------|-------------|
| Shadow Generation | 14 | Elevation-based shadows |
| Shadow Calculation Precision | 6 | Layer calculations |
| Shadow CSS Output | 4 | CSS format validation |
| Shadow Token Names | 2 | Naming conventions |

### Test Cases

#### Shadow Generation

- should generate default shadow scale
- should generate correct number of levels
- should use custom color
- should generate material style shadows with multiple layers
- should generate soft shadows with single layer
- should generate inset shadows
- should generate CSS variables
- should throw error for invalid config
- should throw error for invalid color format
- should generate flat token array
- should have material preset
- should have soft preset
- should have brutalist preset
- should have neumorphism preset

#### Shadow Calculation Precision

- elevation 0 produces no shadow layers
- elevation increases exponentially
- material shadows have correct layer structure
- hard shadows have minimal blur
- soft shadows have higher blur ratio
- opacity scales correctly with baseOpacity

#### Shadow CSS Output

- CSS value format is correct
- inset shadows include inset keyword
- multi-layer shadows are comma-separated
- CSS variables have correct format

#### Shadow Token Names

- level names follow convention
- large level count generates numbered names

---

## Spacing

**File:** `test/spacing.test.ts`

**Total Tests:** 30

### Test Suites

| Suite | Tests | Description |
|-------|-------|-------------|
| Spacing Scale Generation | 16 | Spacing value generation |
| Spacing Fibonacci Sequence | 2 | Fibonacci method tests |
| Spacing Linear Sequence | 2 | Linear method tests |
| Spacing Exponential Sequence | 1 | Exponential method tests |
| Spacing T-Shirt Sizes | 2 | Semantic naming tests |
| Spacing CSS Output | 4 | CSS format generation |
| Spacing Token Export | 3 | Token structure validation |

### Test Cases

#### Spacing Scale Generation

- should generate default fibonacci scale
- should start with 0
- should generate linear scale
- should generate exponential scale
- should generate t-shirt scale with semantic names
- should format values in rem by default
- should format values in px when specified
- should generate CSS variables
- should throw error for invalid config
- should throw error for too many steps
- should generate flat token array
- should include px value
- should have tailwind preset
- should have material preset
- should have natural preset
- should have semantic preset

#### Spacing Fibonacci Sequence

- generates correct fibonacci-like values
- values are integers (no decimals)

#### Spacing Linear Sequence

- generates evenly spaced values
- respects custom base

#### Spacing Exponential Sequence

- generates exponentially growing values

#### Spacing T-Shirt Sizes

- uses semantic names
- has predefined multipliers

#### Spacing CSS Output

- formats rem correctly
- formats em correctly
- formats px correctly
- CSS variables have correct format

#### Spacing Token Export

- tokens have correct category
- token names include prefix
- px value matches computed value

---

## Typography

**File:** `test/typography.test.ts`

**Total Tests:** 29

### Test Suites

| Suite | Tests | Description |
|-------|-------|-------------|
| Typography Scale Generation | 15 | Modular scale generation |
| Typography Scale Math | 6 | Mathematical accuracy |
| Typography Line Height Calculation | 3 | Line height formulas |
| Typography Letter Spacing | 3 | Tracking calculations |
| Typography Font Weight Suggestions | 2 | Weight recommendations |

### Test Cases

#### Typography Scale Generation

- should generate default scale with perfect-fourth ratio
- should generate correct number of tokens
- should include base size
- should scale up correctly
- should accept custom numeric ratio
- should calculate line height based on size
- should calculate letter spacing based on size
- should suggest font weights
- should generate CSS variables
- should format in px when specified
- should throw error for invalid config
- should throw error for invalid ratio
- should generate flat token array
- should format letter spacing as em or normal
- should have all common ratios

#### Typography Scale Math

- golden-ratio produces exact 1.618
- scale down produces values < base
- 0 stepsDown means first token is base size
- large stepsUp generates fallback names
- font sizes scale correctly with ratio
- scale down divides by ratio

#### Typography Line Height Calculation

- small text has looser line height than base
- large text has tighter line height
- line height varies based on font size

#### Typography Letter Spacing

- very small text has positive tracking
- display text has negative tracking
- letter spacing varies across scale

#### Typography Font Weight Suggestions

- display text suggests bold weight
- weights increase with font size

---

## Running Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test contrast

# Run with verbose output
bun test --verbose

# Run in watch mode
bun test --watch
```

## Regenerating This Document

```bash
bun run scripts/generate-test-docs.ts
```