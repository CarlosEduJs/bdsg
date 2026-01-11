#!/usr/bin/env node
import { Command } from "commander";
import { generateCommand } from "./commands/generate.js";
import { initCommand } from "./commands/init.js";
import { validateCommand } from "./commands/validate.js";

const program = new Command();

program
	.name("bdsg")
	.description("Design system generation CLI")
	.version("0.1.0");

program.addCommand(initCommand);
program.addCommand(generateCommand);
program.addCommand(validateCommand);

program.parse();
