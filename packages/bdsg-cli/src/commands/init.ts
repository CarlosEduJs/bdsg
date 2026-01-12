import {
	generatePalette,
	generateShadows,
	generateSpacingScale,
	generateTypographyScale,
} from "bdsg";
import chalk from "chalk";
import { Command } from "commander";
import inquirer from "inquirer";
import ora from "ora";
import { writeTokensToFile } from "../utils/files.js";

export const initCommand = new Command("init")
	.description("Initialize a new design system")
	.option("-o, --output <dir>", "Output directory", "./tokens")
	.action(async (options) => {
		console.log(chalk.bold("\n BDSG - Design System Generator\n"));

		const answers = await inquirer.prompt([
			{
				type: "input",
				name: "projectName",
				message: "Project name:",
				default: "my-design-system",
			},
			{
				type: "input",
				name: "primaryColor",
				message: "Primary color (hex):",
				default: "#3B82F6",
				validate: (input: string) => {
					if (/^#[0-9A-Fa-f]{6}$/.test(input)) return true;
					return "Please enter a valid hex color (e.g., #3B82F6)";
				},
			},
			{
				type: "list",
				name: "typographyRatio",
				message: "Typography scale ratio:",
				choices: [
					{ name: "Minor Second (1.067)", value: "minor-second" },
					{ name: "Major Second (1.125)", value: "major-second" },
					{ name: "Minor Third (1.2)", value: "minor-third" },
					{ name: "Major Third (1.25)", value: "major-third" },
					{ name: "Perfect Fourth (1.333)", value: "perfect-fourth" },
					{ name: "Perfect Fifth (1.5)", value: "perfect-fifth" },
					{ name: "Golden Ratio (1.618)", value: "golden-ratio" },
				],
				default: "perfect-fourth",
			},
			{
				type: "list",
				name: "spacingMethod",
				message: "Spacing method:",
				choices: [
					{ name: "Fibonacci (natural progression)", value: "fibonacci" },
					{ name: "Linear (consistent increments)", value: "linear" },
					{ name: "T-shirt sizes (semantic)", value: "t-shirt" },
				],
				default: "fibonacci",
			},
			{
				type: "list",
				name: "shadowStyle",
				message: "Shadow style:",
				choices: [
					{ name: "Material Design", value: "material" },
					{ name: "Soft", value: "soft" },
					{ name: "Hard", value: "hard" },
				],
				default: "material",
			},
			{
				type: "list",
				name: "outputFormat",
				message: "Output format:",
				choices: [
					{ name: "CSS Variables", value: "css" },
					{ name: "JSON Tokens", value: "json" },
					{ name: "Tailwind v4 (@theme)", value: "tailwind-v4" },
					{ name: "Shadcn/ui (with dark mode)", value: "shadcn" },
				],
				default: "css",
			},
		]);

		const spinner = ora("Generating design tokens...").start();

		try {
			// Generate tokens using bdsg
			const palette = generatePalette(answers.primaryColor, "primary");
			const typography = generateTypographyScale({
				ratio: answers.typographyRatio,
			});
			const spacing = generateSpacingScale({
				method: answers.spacingMethod,
			});
			const shadows = generateShadows({
				style: answers.shadowStyle,
			});

			// Write to files
			await writeTokensToFile({
				palette,
				typography,
				spacing,
				shadows,
				format: answers.outputFormat,
				outputDir: options.output,
			});

			spinner.succeed(chalk.green("Design tokens generated!"));

			console.log(chalk.dim("\nFiles created:"));
			if (answers.outputFormat === "shadcn") {
				console.log(chalk.dim(`  ${options.output}/globals.css`));
			} else if (answers.outputFormat === "tailwind-v4") {
				console.log(chalk.dim(`  ${options.output}/theme.css`));
			} else {
				const ext = answers.outputFormat === "json" ? "json" : "css";
				console.log(chalk.dim(`  ${options.output}/colors.${ext}`));
				console.log(chalk.dim(`  ${options.output}/typography.${ext}`));
				console.log(chalk.dim(`  ${options.output}/spacing.${ext}`));
				console.log(chalk.dim(`  ${options.output}/shadows.${ext}`));
			}
			console.log();
		} catch (error) {
			spinner.fail(chalk.red("Failed to generate tokens"));
			console.error(error);
			process.exit(1);
		}
	});
