const { generatePlanningWorkbook } = require("../services/planning.service");
const { createTimestampedFileName } = require("../utils/date");
const { resolvePath } = require("../utils/file");
const { createLogger } = require("../utils/logger");

function parseArgs(argv) {
  const flags = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) {
      continue;
    }
    const key = arg.slice(2);
    const next = argv[index + 1];
    const value = next && !next.startsWith("--") ? next : true;
    flags[key] = value;
    if (value !== true) {
      index += 1;
    }
  }

  return flags;
}

function isEnabled(value) {
  return value === true || value === "true";
}

function getGenerateCommandHelpText() {
  return "Usage: shift-generator generate --schema schema.json --from YYYY-MM-DD --to YYYY-MM-DD [--output shifts.xlsx] [--verbose] [--trace]";
}

function runGeneratePlanCommand(argv) {
  if (argv.includes("-h") || argv.includes("--help")) {
    return { command: "help", helpText: getGenerateCommandHelpText() };
  }

  const flags = parseArgs(argv);
  const hasAnyRequiredFlag = Boolean(flags.schema || flags.from || flags.to);
  const hasAllRequiredFlags = Boolean(flags.schema && flags.from && flags.to);
  if (!hasAnyRequiredFlag) {
    return { command: "help", helpText: getGenerateCommandHelpText() };
  }
  if (!hasAllRequiredFlags) {
    throw new Error(`Missing required arguments.\n${getGenerateCommandHelpText()}`);
  }

  const trace = isEnabled(flags.trace);
  const verbose = trace || isEnabled(flags.verbose);
  const outputPath = resolvePath(flags.output || createTimestampedFileName("generated-shifts"));
  const result = generatePlanningWorkbook({
    schemaPath: resolvePath(flags.schema || "schema.json"),
    from: flags.from,
    to: flags.to,
    outputPath,
    verbose,
    trace,
    logger: createLogger(),
  });

  return {
    command: "generate",
    outputPath: result.outputPath,
    shifts: result.shifts,
    openShifts: result.openShifts,
    timeOff: result.timeOff,
  };
}

module.exports = {
  runGeneratePlanCommand,
};
