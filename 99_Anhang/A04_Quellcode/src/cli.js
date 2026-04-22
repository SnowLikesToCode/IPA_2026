#!/usr/bin/env node
const { runGenerateSchemaCommand } = require("./commands/generate-schema.command");
const { runGeneratePlanCommand } = require("./commands/generate-plan.command");
const { createLogger } = require("./utils/logger");

function isHelpArg(value) {
  return value === "-h" || value === "--help" || value === "help";
}

function getHelpText() {
  return [
    "shift-generator - CLI",
    "",
    "Usage:",
    "  shift-generator schema --input teams-export.xlsx --output schema.json",
    "  shift-generator generate --schema schema.json --from YYYY-MM-DD --to YYYY-MM-DD [--output shifts.xlsx] [--verbose] [--trace]",
    "",
    "Commands:",
    "  schema    Generate schema.json from Teams export workbook",
    "  generate  Generate a shift plan workbook from schema.json",
    "",
    "Examples:",
    "  shift-generator schema --input teams-export.xlsx --output schema.json",
    "  shift-generator generate --schema schema.json --from 2026-04-01 --to 2026-04-30",
  ].join("\n");
}

function runCli(argsInput = process.argv.slice(2)) {
  const command = argsInput[0];

  if (!command || isHelpArg(command)) {
    return {
      command: "help",
      helpText: getHelpText(),
    };
  }

  if (command === "schema") {
    return runGenerateSchemaCommand(argsInput.slice(1));
  }

  if (command === "generate" || command === "export") {
    return runGeneratePlanCommand(argsInput.slice(1));
  }

  throw new Error(`Unknown command: ${command}\n\n${getHelpText()}`);
}

function printCliResult(result, logger = createLogger()) {
  if (result.command === "help") {
    logger.info(result.helpText);
    return;
  }

  if (result.command === "schema") {
    logger.info(
      `Generated ${result.outputPath} from ${result.inputPath} with ${result.groupCount} groups.`,
    );
    return;
  }

  if (result.command === "generate") {
    logger.info(
      `Generated ${result.outputPath} | shifts=${result.shifts} openShifts=${result.openShifts} timeOff=${result.timeOff}`,
    );
  }
}

function main() {
  try {
    const result = runCli(process.argv.slice(2));
    printCliResult(result, createLogger());
  } catch (error) {
    createLogger().error(error.message);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  main,
  runCli,
  printCliResult,
  getHelpText,
  isHelpArg,
};
