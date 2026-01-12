# bdsg-cli

[![npm version](https://img.shields.io/npm/v/bdsg-cli.svg)](https://www.npmjs.com/package/bdsg-cli)
[![CI](https://github.com/CarlosEduJs/bdsg/actions/workflows/ci.yml/badge.svg)](https://github.com/CarlosEduJs/bdsg/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Interactive CLI for design system generation. Generate design tokens with WCAG accessibility compliance without leaving your terminal.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Commands](#commands)
  - [init](#init)
  - [generate](#generate)
  - [validate](#validate)
- [Output Formats](#output-formats)
- [License](#license)

## Installation

```bash
npm install -g bdsg-cli
# or
bun add -g bdsg-cli
```

## Quick Start

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

## Commands

### init

Interactive setup to generate a complete design system.

```bash
bdsg init [options]

Options:
  -o, --output <dir>  Output directory (default: "./tokens")
```

**Prompts:**

- Project name
- Primary color (hex)
- Typography scale ratio
- Spacing method
- Shadow style
- Output format

**Example:**

```
$ bdsg init

BDSG - Design System Generator

? Project name: my-design-system
? Primary color (hex): #3B82F6
? Typography scale ratio: Perfect Fourth (1.333)
? Spacing method: Fibonacci (natural progression)
? Shadow style: Material Design
? Output format: Shadcn/ui (with dark mode)

✔ Design tokens generated!

Files created:
  ./tokens/globals.css
```

### generate

Generate specific design tokens individually.

#### generate palette

```bash
bdsg generate palette <color> [options]

Arguments:
  color                Base color in hex format (e.g., #3B82F6)

Options:
  -n, --name <name>    Palette name (default: "primary")
  -o, --output <dir>   Output directory (default: "./tokens")
  -f, --format <fmt>   Output format: css, json (default: "css")
```

**Example:**

```
$ bdsg generate palette "#10B981" -n success

✔ Palette generated!

File: ./tokens/success.css

Color shades:
  50: #f5f9f8
  100: #e9f2ef
  200: #c5ecdf
  ...
  900: #15513d
```

#### generate typography

```bash
bdsg generate typography [options]

Options:
  -r, --ratio <ratio>  Scale ratio (default: "perfect-fourth")
  -b, --base <size>    Base font size in px (default: "16")
  -o, --output <dir>   Output directory (default: "./tokens")
  -f, --format <fmt>   Output format: css, json (default: "css")
```

Available ratios: `minor-second`, `major-second`, `minor-third`, `major-third`, `perfect-fourth`, `perfect-fifth`, `golden-ratio`

#### generate spacing

```bash
bdsg generate spacing [options]

Options:
  -m, --method <method>  Spacing method (default: "fibonacci")
  -b, --base <size>      Base spacing in px (default: "8")
  -o, --output <dir>     Output directory (default: "./tokens")
  -f, --format <fmt>     Output format: css, json (default: "css")
```

Available methods: `fibonacci`, `linear`, `t-shirt`

#### generate shadows

```bash
bdsg generate shadows [options]

Options:
  -s, --style <style>  Shadow style (default: "material")
  -o, --output <dir>   Output directory (default: "./tokens")
  -f, --format <fmt>   Output format: css, json (default: "css")
```

Available styles: `material`, `soft`, `hard`

### validate

Validate WCAG contrast between two colors with suggestions for accessibility compliance.

```bash
bdsg validate <foreground> <background> [options]

Arguments:
  foreground           Foreground color in hex format
  background           Background color in hex format

Options:
  -l, --level <level>  Target WCAG level: AA, AAA (default: "AA")
  -s, --size <size>    Text size: normal, large (default: "normal")
```

**Example:**

```
$ bdsg validate "#3B82F6" "#FFFFFF"

Contrast Analysis

Colors
──────────────────
  Foreground: #3B82F6
  Background: ████ #FFFFFF
  Ratio:      3.68:1

WCAG Results
──────────────────
  AA Normal Text:  ✗ Fail (needs 4.5:1)
  AA Large Text:   ✓ Pass (needs 3.0:1)
  AAA Normal Text: ✗ Fail (needs 7.0:1)
  AAA Large Text:  ✗ Fail (needs 4.5:1)

Suggestion
──────────────────
  For AA normal text compliance:
  Try: #2563EB (ratio: 4.52:1)
  Strategy: lightness
```

## Output Formats

### CSS Variables

```css
:root {
  --color-primary-50: #eff6ff;
  --color-primary-500: #3b82f6;
  --font-size-base: 1rem;
  --spacing-4: 1rem;
}
```

### JSON Tokens

```json
{
  "colors": {
    "primary-50": "#eff6ff",
    "primary-500": "#3b82f6"
  }
}
```

### Tailwind v4

```css
@import "tailwindcss";

@theme {
  --color-primary-50: #eff6ff;
  --color-primary-500: #3b82f6;
  --font-size-base: 1rem;
  --spacing-4: 1rem;
}
```

### Shadcn/ui

Generates a complete `globals.css` compatible with shadcn/ui:

- Semantic tokens (`--primary`, `--secondary`, `--accent`, etc.)
- Dark mode with `.dark` class
- `@theme inline` block for Tailwind v4
- `@layer base` styles

```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-primary: var(--primary);
  --color-secondary: var(--secondary);
  /* ... */
}

:root {
  --primary: #3B82F6;
  --primary-foreground: #FFFFFF;
  /* ... */
}

.dark {
  --primary: #60A5FA;
  --primary-foreground: #1E3A5F;
  /* ... */
}
```

## License

MIT
