import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
	EASING,
	generateGradient,
	generatePalette,
	generateShadows,
	generateSpacingScale,
	generateTypographyScale,
	toCssGradient,
} from "bdsg";
import chalk from "chalk";
import { Command } from "commander";
import ora from "ora";

export const generateCommand = new Command("generate")
	.description("Generate specific design tokens")
	.addCommand(
		new Command("palette")
			.description("Generate a color palette from a base color")
			.argument("<color>", "Base color in hex format (e.g., #3B82F6)")
			.option("-n, --name <name>", "Palette name", "primary")
			.option("-o, --output <dir>", "Output directory", "./tokens")
			.option("-f, --format <format>", "Output format (css, json)", "css")
			.action(async (color, options) => {
				const spinner = ora("Generating palette...").start();

				try {
					const palette = generatePalette(color, options.name);
					await mkdir(options.output, { recursive: true });

					if (options.format === "json") {
						const colors: Record<string, string> = {};
						for (const [shade, data] of Object.entries(palette.shades)) {
							colors[`${options.name}-${shade}`] = data.value;
						}
						await writeFile(
							join(options.output, `${options.name}.json`),
							JSON.stringify({ colors }, null, 2),
						);
					} else {
						let css = ":root {\n";
						for (const [shade, data] of Object.entries(palette.shades)) {
							css += `  --color-${options.name}-${shade}: ${data.value};\n`;
						}
						css += "}\n";
						await writeFile(join(options.output, `${options.name}.css`), css);
					}

					spinner.succeed(chalk.green("Palette generated!"));
					console.log(
						chalk.dim(
							`\nFile: ${options.output}/${options.name}.${options.format}`,
						),
					);
					console.log();

					// Show preview
					console.log(chalk.bold("Color shades:"));
					for (const [shade, data] of Object.entries(palette.shades)) {
						console.log(`  ${shade}: ${data.value}`);
					}
					console.log();
				} catch (error) {
					spinner.fail(chalk.red("Failed to generate palette"));
					console.error(error);
					process.exit(1);
				}
			}),
	)
	.addCommand(
		new Command("typography")
			.description("Generate a typography scale")
			.option("-r, --ratio <ratio>", "Scale ratio", "perfect-fourth")
			.option("-b, --base <size>", "Base font size in px", "16")
			.option("-o, --output <dir>", "Output directory", "./tokens")
			.option("-f, --format <format>", "Output format (css, json)", "css")
			.action(async (options) => {
				const spinner = ora("Generating typography scale...").start();

				try {
					const typography = generateTypographyScale({
						ratio: options.ratio,
						base: Number.parseInt(options.base, 10),
					});
					await mkdir(options.output, { recursive: true });

					if (options.format === "json") {
						const tokens: Record<string, unknown> = {};
						for (const token of typography.tokens) {
							tokens[token.name] = {
								fontSize: token.fontSize,
								lineHeight: token.lineHeight,
								letterSpacing: token.letterSpacing,
							};
						}
						await writeFile(
							join(options.output, "typography.json"),
							JSON.stringify({ typography: tokens }, null, 2),
						);
					} else {
						await writeFile(
							join(options.output, "typography.css"),
							typography.cssVariables,
						);
					}

					spinner.succeed(chalk.green("Typography scale generated!"));
					console.log(
						chalk.dim(`\nFile: ${options.output}/typography.${options.format}`),
					);
					console.log();

					// Show preview
					console.log(chalk.bold("Font sizes:"));
					for (const token of typography.tokens) {
						console.log(`  ${token.name}: ${token.fontSize}px`);
					}
					console.log();
				} catch (error) {
					spinner.fail(chalk.red("Failed to generate typography"));
					console.error(error);
					process.exit(1);
				}
			}),
	)
	.addCommand(
		new Command("spacing")
			.description("Generate a spacing scale")
			.option(
				"-m, --method <method>",
				"Spacing method (fibonacci, linear, t-shirt)",
				"fibonacci",
			)
			.option("-b, --base <size>", "Base spacing in px", "8")
			.option("-o, --output <dir>", "Output directory", "./tokens")
			.option("-f, --format <format>", "Output format (css, json)", "css")
			.action(async (options) => {
				const spinner = ora("Generating spacing scale...").start();

				try {
					const spacing = generateSpacingScale({
						method: options.method,
						base: Number.parseInt(options.base, 10),
					});
					await mkdir(options.output, { recursive: true });

					if (options.format === "json") {
						const tokens: Record<string, unknown> = {};
						for (const token of spacing.tokens) {
							tokens[token.name] = {
								value: token.formatted,
								px: token.value,
							};
						}
						await writeFile(
							join(options.output, "spacing.json"),
							JSON.stringify({ spacing: tokens }, null, 2),
						);
					} else {
						await writeFile(
							join(options.output, "spacing.css"),
							spacing.cssVariables,
						);
					}

					spinner.succeed(chalk.green("Spacing scale generated!"));
					console.log(
						chalk.dim(`\nFile: ${options.output}/spacing.${options.format}`),
					);
					console.log();

					// Show preview
					console.log(chalk.bold("Spacing values:"));
					for (const token of spacing.tokens) {
						console.log(`  ${token.name}: ${token.formatted}`);
					}
					console.log();
				} catch (error) {
					spinner.fail(chalk.red("Failed to generate spacing"));
					console.error(error);
					process.exit(1);
				}
			}),
	)
	.addCommand(
		new Command("shadows")
			.description("Generate shadow tokens")
			.option(
				"-s, --style <style>",
				"Shadow style (material, soft, hard)",
				"material",
			)
			.option("-o, --output <dir>", "Output directory", "./tokens")
			.option("-f, --format <format>", "Output format (css, json)", "css")
			.action(async (options) => {
				const spinner = ora("Generating shadows...").start();

				try {
					const shadows = generateShadows({
						style: options.style,
					});
					await mkdir(options.output, { recursive: true });

					if (options.format === "json") {
						const tokens: Record<string, string> = {};
						for (const token of shadows.tokens) {
							tokens[token.name] = token.value;
						}
						await writeFile(
							join(options.output, "shadows.json"),
							JSON.stringify({ shadows: tokens }, null, 2),
						);
					} else {
						await writeFile(
							join(options.output, "shadows.css"),
							shadows.cssVariables,
						);
					}

					spinner.succeed(chalk.green("Shadows generated!"));
					console.log(
						chalk.dim(`\nFile: ${options.output}/shadows.${options.format}`),
					);
					console.log();

					// Show preview
					console.log(chalk.bold("Shadow levels:"));
					for (const token of shadows.tokens) {
						console.log(`  ${token.name}: elevation ${token.elevation}`);
					}
					console.log();
				} catch (error) {
					spinner.fail(chalk.red("Failed to generate shadows"));
					console.error(error);
					process.exit(1);
				}
			}),
	)
	.addCommand(
		new Command("gradient")
			.description("Generate a color gradient")
			.argument("<startColor>", "Start color in hex format (e.g., #FF0000)")
			.argument("<endColor>", "End color in hex format (e.g., #0000FF)")
			.option("-n, --name <name>", "Gradient name", "gradient")
			.option("-s, --steps <steps>", "Number of color steps", "5")
			.option(
				"-e, --easing <easing>",
				"Easing function (linear, easeIn, easeOut, easeInOut)",
				"linear",
			)
			.option(
				"-d, --direction <direction>",
				"Hue direction (shorter, longer, increasing, decreasing)",
				"shorter",
			)
			.option("-o, --output <dir>", "Output directory", "./tokens")
			.option("-f, --format <format>", "Output format (css, json)", "css")
			.action(async (startColor, endColor, options) => {
				const spinner = ora("Generating gradient...").start();

				try {
					const steps = Number.parseInt(options.steps, 10);
					const easingFn =
						EASING[options.easing as keyof typeof EASING] || EASING.linear;

					const colors = generateGradient(startColor, endColor, steps, {
						easing: easingFn,
						hueDirection: options.direction,
					});

					await mkdir(options.output, { recursive: true });

					if (options.format === "json") {
						const gradient: Record<string, unknown> = {
							name: options.name,
							start: startColor,
							end: endColor,
							steps,
							colors,
							css: {
								linear: toCssGradient("linear", colors, 90),
								radial: toCssGradient("radial", colors),
							},
						};
						await writeFile(
							join(options.output, `${options.name}.json`),
							JSON.stringify({ gradient }, null, 2),
						);
					} else {
						let css = ":root {\n";
						for (let i = 0; i < colors.length; i++) {
							css += `  --${options.name}-${i + 1}: ${colors[i]};\n`;
						}
						css += `  --${options.name}-linear: ${toCssGradient("linear", colors, 90)};\n`;
						css += `  --${options.name}-radial: ${toCssGradient("radial", colors)};\n`;
						css += "}\n";
						await writeFile(join(options.output, `${options.name}.css`), css);
					}

					spinner.succeed(chalk.green("Gradient generated!"));
					console.log(
						chalk.dim(
							`\nFile: ${options.output}/${options.name}.${options.format}`,
						),
					);
					console.log();

					// Show preview
					console.log(chalk.bold("Gradient colors:"));
					for (let i = 0; i < colors.length; i++) {
						console.log(`  ${i + 1}: ${colors[i]}`);
					}
					console.log();
					console.log(chalk.bold("CSS Gradients:"));
					console.log(`  linear: ${toCssGradient("linear", colors, 90)}`);
					console.log(`  radial: ${toCssGradient("radial", colors)}`);
					console.log();
				} catch (error) {
					spinner.fail(chalk.red("Failed to generate gradient"));
					console.error(error);
					process.exit(1);
				}
			}),
	);
