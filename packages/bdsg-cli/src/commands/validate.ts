import { adjustColorForContrast, calculateContrast, meetsWCAG } from "bdsg";
import chalk from "chalk";
import { Command } from "commander";

export const validateCommand = new Command("validate")
	.description("Validate WCAG contrast between colors")
	.argument("<foreground>", "Foreground color in hex format")
	.argument("<background>", "Background color in hex format")
	.option("-l, --level <level>", "Target WCAG level (AA, AAA)", "AA")
	.option("-s, --size <size>", "Text size (normal, large)", "normal")
	.action((foreground, background, options) => {
		console.log(chalk.bold("\n Contrast Analysis\n"));

		// Calculate contrast
		const ratio = calculateContrast(foreground, background);

		// Check each combination
		const AANormal = meetsWCAG(ratio, "AA", "normal");
		const AALarge = meetsWCAG(ratio, "AA", "large");
		const AAANormal = meetsWCAG(ratio, "AAA", "normal");
		const AAALarge = meetsWCAG(ratio, "AAA", "large");

		// Display colors
		console.log(chalk.dim("Colors"));
		console.log(chalk.dim("──────────────────"));
		console.log(`  Foreground: ${chalk.hex(foreground)(foreground)}`);
		console.log(`  Background: ${chalk.hex(background)("████")} ${background}`);
		console.log(`  Ratio:      ${chalk.bold(ratio.toFixed(2))}:1`);
		console.log();

		// WCAG Results
		console.log(chalk.dim("WCAG Results"));
		console.log(chalk.dim("──────────────────"));

		const passSymbol = chalk.green("✓ Pass");
		const failSymbol = chalk.red("✗ Fail");

		console.log(
			`  AA Normal Text:  ${AANormal ? passSymbol : failSymbol} (needs 4.5:1)`,
		);
		console.log(
			`  AA Large Text:   ${AALarge ? passSymbol : failSymbol} (needs 3.0:1)`,
		);
		console.log(
			`  AAA Normal Text: ${AAANormal ? passSymbol : failSymbol} (needs 7.0:1)`,
		);
		console.log(
			`  AAA Large Text:  ${AAALarge ? passSymbol : failSymbol} (needs 4.5:1)`,
		);
		console.log();

		// Suggest fix if failing target level
		const targetLevel = options.level as "AA" | "AAA";
		const textSize = options.size as "normal" | "large";
		const targetMet = meetsWCAG(ratio, targetLevel, textSize);

		if (!targetMet) {
			console.log(chalk.dim("Suggestion"));
			console.log(chalk.dim("──────────────────"));

			try {
				const adjusted = adjustColorForContrast(
					foreground,
					background,
					targetLevel,
					textSize,
				);

				if (adjusted.adjusted !== foreground) {
					console.log(`  For ${targetLevel} ${textSize} text compliance:`);
					console.log(
						`  Try: ${chalk.hex(adjusted.adjusted)(adjusted.adjusted)} (ratio: ${adjusted.ratio.toFixed(2)}:1)`,
					);
					console.log(`  Strategy: ${adjusted.strategy}`);
				} else {
					console.log(chalk.yellow("  Could not find a suitable adjustment."));
				}
			} catch {
				console.log(chalk.yellow("  Could not calculate adjustment."));
			}
			console.log();
		} else {
			console.log(
				chalk.green(
					`✓ Colors meet ${targetLevel} ${textSize} text requirements!\n`,
				),
			);
		}
	});
