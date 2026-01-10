#!/usr/bin/env bun
/**
 * Test Documentation Generator
 *
 * Parses test files and generates comprehensive markdown documentation.
 *
 * Usage: bun run scripts/generate-test-docs.ts
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";

interface TestSuite {
	name: string;
	tests: string[];
	nested: TestSuite[];
}

interface TestFile {
	filename: string;
	moduleName: string;
	suites: TestSuite[];
	totalTests: number;
}

interface TestStats {
	totalTests: number;
	totalFiles: number;
	files: TestFile[];
}

/**
 * Parse a test file and extract describe/test blocks
 */
function parseTestFile(content: string, filename: string): TestFile {
	const suites: TestSuite[] = [];

	// Use regex to find all test cases
	const testMatches = content.matchAll(
		/(?:test|it)\s*\(\s*["'`]([^"'`]+)["'`]/g,
	);
	const allTests = [...testMatches]
		.map((m) => m[1])
		.filter(Boolean) as string[];

	// Use regex to find all describe blocks
	const describeMatches = content.matchAll(
		/describe\s*\(\s*["'`]([^"'`]+)["'`]/g,
	);
	const allDescribes = [...describeMatches]
		.map((m) => m[1])
		.filter(Boolean) as string[];

	// Create flat list of suites for simplicity
	for (const name of allDescribes) {
		suites.push({
			name,
			tests: [],
			nested: [],
		});
	}

	const lines = content.split("\n");
	let currentSuite: TestSuite | null = null;
	let braceCount = 0;
	let inDescribe = false;

	for (const line of lines) {
		const descMatch = line.match(/^\s*describe\s*\(\s*["'`]([^"'`]+)["'`]/);
		if (descMatch?.[1] && braceCount === 0) {
			currentSuite = suites.find((s) => s.name === descMatch[1]) ?? null;
			inDescribe = true;
		}

		const testMatch = line.match(/^\s*(?:test|it)\s*\(\s*["'`]([^"'`]+)["'`]/);
		if (testMatch?.[1] && currentSuite) {
			currentSuite.tests.push(testMatch[1]);
		}

		// Track braces to know when we exit the describe block
		braceCount += (line.match(/\{/g) || []).length;
		braceCount -= (line.match(/\}/g) || []).length;

		if (inDescribe && braceCount === 0) {
			currentSuite = null;
			inDescribe = false;
		}
	}

	// Derive module name from filename
	const moduleName = basename(filename, ".test.ts")
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");

	return {
		filename,
		moduleName,
		suites: suites.filter((s) => s.tests.length > 0),
		totalTests: allTests.length,
	};
}

/**
 * Generate markdown documentation from parsed test data
 */
function generateMarkdown(stats: TestStats): string {
	const lines: string[] = [];

	// Header
	lines.push("# Test Documentation: bdsg");
	lines.push("");
	lines.push(
		"This document is auto-generated from the test files. Do not edit manually.",
	);
	lines.push("");
	lines.push(`Generated: ${new Date().toISOString().split("T")[0]}`);
	lines.push("");

	// Overview
	lines.push("## Overview");
	lines.push("");
	lines.push("| Metric | Value |");
	lines.push("|--------|-------|");
	lines.push(`| Total Tests | ${stats.totalTests} |`);
	lines.push(`| Test Files | ${stats.totalFiles} |`);
	lines.push("");
	lines.push("---");
	lines.push("");

	// Test Structure
	lines.push("## Test Structure");
	lines.push("");
	lines.push("```");
	lines.push("test/");
	for (const file of stats.files) {
		const padding = " ".repeat(4 - file.filename.length / 10);
		lines.push(
			`  ${file.filename}${padding}# ${file.moduleName} (${file.totalTests} tests)`,
		);
	}
	lines.push("```");
	lines.push("");
	lines.push("---");
	lines.push("");

	// Summary Table
	lines.push("## Test Summary by Module");
	lines.push("");
	lines.push("| Module | File | Tests | Suites |");
	lines.push("|--------|------|-------|--------|");
	for (const file of stats.files) {
		const suiteCount = file.suites.length;
		lines.push(
			`| ${file.moduleName} | \`${file.filename}\` | ${file.totalTests} | ${suiteCount} |`,
		);
	}
	lines.push("");
	lines.push("---");
	lines.push("");

	// Detailed documentation for each file
	for (const file of stats.files) {
		lines.push(`## ${file.moduleName}`);
		lines.push("");
		lines.push(`**File:** \`test/${file.filename}\``);
		lines.push("");
		lines.push(`**Total Tests:** ${file.totalTests}`);
		lines.push("");

		// Suite table
		if (file.suites.length > 0) {
			lines.push("### Test Suites");
			lines.push("");
			lines.push("| Suite | Tests | Description |");
			lines.push("|-------|-------|-------------|");

			for (const suite of file.suites) {
				const directTests = suite.tests.length;
				const nestedTests = suite.nested.reduce(
					(sum, n) => sum + n.tests.length,
					0,
				);
				const total = directTests + nestedTests;
				const desc = inferDescription(suite.name);
				lines.push(`| ${suite.name} | ${total} | ${desc} |`);

				// Add nested suites
				for (const nested of suite.nested) {
					lines.push(
						`| - ${nested.name} | ${nested.tests.length} | ${inferDescription(nested.name)} |`,
					);
				}
			}
			lines.push("");
		}

		// Test list
		lines.push("### Test Cases");
		lines.push("");

		for (const suite of file.suites) {
			if (suite.tests.length > 0 || suite.nested.length > 0) {
				lines.push(`#### ${suite.name}`);
				lines.push("");

				if (suite.tests.length > 0) {
					for (const test of suite.tests) {
						lines.push(`- ${test}`);
					}
					lines.push("");
				}

				for (const nested of suite.nested) {
					if (nested.tests.length > 0) {
						lines.push(`**${nested.name}:**`);
						lines.push("");
						for (const test of nested.tests) {
							lines.push(`- ${test}`);
						}
						lines.push("");
					}
				}
			}
		}

		lines.push("---");
		lines.push("");
	}

	// Running tests section
	lines.push("## Running Tests");
	lines.push("");
	lines.push("```bash");
	lines.push("# Run all tests");
	lines.push("bun test");
	lines.push("");
	lines.push("# Run specific test file");
	lines.push("bun test contrast");
	lines.push("");
	lines.push("# Run with verbose output");
	lines.push("bun test --verbose");
	lines.push("");
	lines.push("# Run in watch mode");
	lines.push("bun test --watch");
	lines.push("```");
	lines.push("");

	// Regenerate section
	lines.push("## Regenerating This Document");
	lines.push("");
	lines.push("```bash");
	lines.push("bun run scripts/generate-test-docs.ts");
	lines.push("```");

	return lines.join("\n");
}

/**
 * Infer a description from suite name
 */
function inferDescription(name: string): string {
	const descriptions: Record<string, string> = {
		"Color Utilities": "HEX, RGB, HSL color conversions",
		"Luminance Cache": "Cache behavior and normalization",
		"Contrast Calculation": "WCAG contrast ratio calculations",
		"WCAG Threshold Precision": "Exact threshold boundary tests",
		"Relative Luminance Precision": "RGB coefficient accuracy",
		"Contrast Ratio Edge Cases": "Input format handling",
		"getWCAGCompliance Edge Cases": "Compliance level determination",
		"Color Adjustment": "Accessibility color adjustments",
		"Color Adjustment Edge Cases": "Boundary conditions",
		"generateAccessibleVariations Edge Cases": "Variation generation",
		"Palette Generation": "10-shade palette creation",
		"Palette Tokens": "Token array generation",
		"Palette Edge Cases": "Special color handling",
		"Palette Token Generation": "Token naming and ordering",
		"Typography Scale Generation": "Modular scale generation",
		"Typography Scale Math": "Mathematical accuracy",
		"Typography Line Height Calculation": "Line height formulas",
		"Typography Letter Spacing": "Tracking calculations",
		"Typography Font Weight Suggestions": "Weight recommendations",
		"Spacing Scale Generation": "Spacing value generation",
		"Spacing Fibonacci Sequence": "Fibonacci method tests",
		"Spacing Linear Sequence": "Linear method tests",
		"Spacing Exponential Sequence": "Exponential method tests",
		"Spacing T-Shirt Sizes": "Semantic naming tests",
		"Spacing CSS Output": "CSS format generation",
		"Spacing Token Export": "Token structure validation",
		"Shadow Generation": "Elevation-based shadows",
		"Shadow Calculation Precision": "Layer calculations",
		"Shadow CSS Output": "CSS format validation",
		"Shadow Token Names": "Naming conventions",
		"Relations Detection": "Token relationship detection",
		"Module Exports": "Public API verification",
		"Integration Smoke Tests": "End-to-end verification",
	};

	return descriptions[name] || "Test suite";
}

/**
 * Main function
 */
async function main() {
	const testDir = join(import.meta.dir, "..", "test");
	const outputPath = join(testDir, "TESTS.md");

	console.log("Scanning test directory:", testDir);

	// Read all test files
	const files = await readdir(testDir);
	const testFiles = files.filter((f) => f.endsWith(".test.ts")).sort();

	console.log(`Found ${testFiles.length} test files`);

	const parsedFiles: TestFile[] = [];

	for (const filename of testFiles) {
		const filepath = join(testDir, filename);
		const content = await readFile(filepath, "utf-8");
		const parsed = parseTestFile(content, filename);
		parsedFiles.push(parsed);
		console.log(`  ${filename}: ${parsed.totalTests} tests`);
	}

	const stats: TestStats = {
		totalTests: parsedFiles.reduce((sum, f) => sum + f.totalTests, 0),
		totalFiles: parsedFiles.length,
		files: parsedFiles,
	};

	console.log(
		`\nTotal: ${stats.totalTests} tests across ${stats.totalFiles} files`,
	);

	// Generate markdown
	const markdown = generateMarkdown(stats);

	// Write output
	await writeFile(outputPath, markdown, "utf-8");
	console.log(`\nDocumentation written to: ${outputPath}`);
}

main().catch(console.error);
