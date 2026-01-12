import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type {
	ColorPalette,
	ShadowScale,
	SpacingScale,
	TypographyScale,
} from "bdsg";

interface TokensToWrite {
	palette: ColorPalette;
	typography: TypographyScale;
	spacing: SpacingScale;
	shadows: ShadowScale;
	format: "css" | "json" | "tailwind-v4" | "shadcn";
	outputDir: string;
}

export async function writeTokensToFile(tokens: TokensToWrite): Promise<void> {
	await mkdir(tokens.outputDir, { recursive: true });

	if (tokens.format === "json") {
		await writeJsonTokens(tokens);
	} else if (tokens.format === "tailwind-v4") {
		await writeTailwindV4Tokens(tokens);
	} else if (tokens.format === "shadcn") {
		await writeShadcnTokens(tokens);
	} else {
		await writeCssTokens(tokens);
	}
}

async function writeCssTokens(tokens: TokensToWrite): Promise<void> {
	// Colors CSS
	const colorsContent = generateColorsCss(tokens.palette);
	await writeFile(join(tokens.outputDir, "colors.css"), colorsContent);

	// Typography CSS
	await writeFile(
		join(tokens.outputDir, "typography.css"),
		tokens.typography.cssVariables,
	);

	// Spacing CSS
	await writeFile(
		join(tokens.outputDir, "spacing.css"),
		tokens.spacing.cssVariables,
	);

	// Shadows CSS
	await writeFile(
		join(tokens.outputDir, "shadows.css"),
		tokens.shadows.cssVariables,
	);
}

async function writeJsonTokens(tokens: TokensToWrite): Promise<void> {
	// Colors JSON
	const colors: Record<string, string> = {};
	for (const [shade, data] of Object.entries(tokens.palette.shades)) {
		colors[`primary-${shade}`] = data.value;
	}
	await writeFile(
		join(tokens.outputDir, "colors.json"),
		JSON.stringify({ colors }, null, 2),
	);

	// Typography JSON
	const typography: Record<string, unknown> = {};
	for (const token of tokens.typography.tokens) {
		typography[token.name] = {
			fontSize: token.fontSize,
			lineHeight: token.lineHeight,
			letterSpacing: token.letterSpacing,
		};
	}
	await writeFile(
		join(tokens.outputDir, "typography.json"),
		JSON.stringify({ typography }, null, 2),
	);

	// Spacing JSON
	const spacing: Record<string, unknown> = {};
	for (const token of tokens.spacing.tokens) {
		spacing[token.name] = {
			value: token.formatted,
			px: token.value,
		};
	}
	await writeFile(
		join(tokens.outputDir, "spacing.json"),
		JSON.stringify({ spacing }, null, 2),
	);

	// Shadows JSON
	const shadows: Record<string, string> = {};
	for (const token of tokens.shadows.tokens) {
		shadows[token.name] = token.value;
	}
	await writeFile(
		join(tokens.outputDir, "shadows.json"),
		JSON.stringify({ shadows }, null, 2),
	);
}

async function writeTailwindV4Tokens(tokens: TokensToWrite): Promise<void> {
	let content = '@import "tailwindcss";\n\n@theme {\n';

	// Colors
	for (const [shade, data] of Object.entries(tokens.palette.shades)) {
		content += `  --color-primary-${shade}: ${data.value};\n`;
	}
	content += "\n";

	// Typography
	for (const token of tokens.typography.tokens) {
		const remValue = token.fontSize / 16;
		content += `  --font-size-${token.name}: ${remValue}rem;\n`;
	}
	content += "\n";

	// Spacing
	for (const token of tokens.spacing.tokens) {
		content += `  --spacing-${token.name}: ${token.formatted};\n`;
	}
	content += "\n";

	// Shadows
	for (const token of tokens.shadows.tokens) {
		content += `  --shadow-${token.name}: ${token.value};\n`;
	}

	content += "}\n";

	await writeFile(join(tokens.outputDir, "theme.css"), content);
}

function generateColorsCss(palette: ColorPalette): string {
	let css = ":root {\n";
	for (const [shade, data] of Object.entries(palette.shades)) {
		css += `  --color-primary-${shade}: ${data.value};\n`;
	}
	css += "}\n";
	return css;
}

async function writeShadcnTokens(tokens: TokensToWrite): Promise<void> {
	const shades = tokens.palette.shades;

	// Light mode tokens (using palette shades)
	const lightTokens = {
		background: "#ffffff",
		foreground: shades[900].value,
		card: "#ffffff",
		"card-foreground": shades[900].value,
		popover: "#ffffff",
		"popover-foreground": shades[900].value,
		primary: shades[500].value,
		"primary-foreground": shades[50].value,
		secondary: shades[100].value,
		"secondary-foreground": shades[900].value,
		muted: shades[100].value,
		"muted-foreground": shades[500].value,
		accent: shades[100].value,
		"accent-foreground": shades[900].value,
		destructive: "#ef4444",
		border: shades[200].value,
		input: shades[200].value,
		ring: shades[500].value,
	};

	// Dark mode tokens (inverted)
	const darkTokens = {
		background: shades[900].value,
		foreground: shades[50].value,
		card: shades[800].value,
		"card-foreground": shades[50].value,
		popover: shades[800].value,
		"popover-foreground": shades[50].value,
		primary: shades[400].value,
		"primary-foreground": shades[900].value,
		secondary: shades[700].value,
		"secondary-foreground": shades[50].value,
		muted: shades[700].value,
		"muted-foreground": shades[400].value,
		accent: shades[700].value,
		"accent-foreground": shades[50].value,
		destructive: "#dc2626",
		border: shades[700].value,
		input: shades[700].value,
		ring: shades[400].value,
	};

	let content = '@import "tailwindcss";\n\n';

	// @theme block for Tailwind v4 mapping
	content += "@custom-variant dark (&:is(.dark *));\n\n";
	content += "@theme inline {\n";
	content += "  --color-background: var(--background);\n";
	content += "  --color-foreground: var(--foreground);\n";
	content += "  --color-card: var(--card);\n";
	content += "  --color-card-foreground: var(--card-foreground);\n";
	content += "  --color-popover: var(--popover);\n";
	content += "  --color-popover-foreground: var(--popover-foreground);\n";
	content += "  --color-primary: var(--primary);\n";
	content += "  --color-primary-foreground: var(--primary-foreground);\n";
	content += "  --color-secondary: var(--secondary);\n";
	content += "  --color-secondary-foreground: var(--secondary-foreground);\n";
	content += "  --color-muted: var(--muted);\n";
	content += "  --color-muted-foreground: var(--muted-foreground);\n";
	content += "  --color-accent: var(--accent);\n";
	content += "  --color-accent-foreground: var(--accent-foreground);\n";
	content += "  --color-destructive: var(--destructive);\n";
	content += "  --color-border: var(--border);\n";
	content += "  --color-input: var(--input);\n";
	content += "  --color-ring: var(--ring);\n";
	content += "  --radius-sm: calc(var(--radius) - 4px);\n";
	content += "  --radius-md: calc(var(--radius) - 2px);\n";
	content += "  --radius-lg: var(--radius);\n";
	content += "  --radius-xl: calc(var(--radius) + 4px);\n";
	content += "}\n\n";

	// :root with light mode tokens
	content += ":root {\n";
	content += "  --radius: 0.625rem;\n";
	for (const [name, value] of Object.entries(lightTokens)) {
		content += `  --${name}: ${value};\n`;
	}
	content += "}\n\n";

	// .dark with dark mode tokens
	content += ".dark {\n";
	for (const [name, value] of Object.entries(darkTokens)) {
		content += `  --${name}: ${value};\n`;
	}
	content += "}\n\n";

	// Base layer
	content += "@layer base {\n";
	content += "  * {\n";
	content += "    @apply border-border outline-ring/50;\n";
	content += "  }\n";
	content += "  body {\n";
	content += "    @apply bg-background text-foreground;\n";
	content += "  }\n";
	content += "}\n";

	await writeFile(join(tokens.outputDir, "globals.css"), content);
}
