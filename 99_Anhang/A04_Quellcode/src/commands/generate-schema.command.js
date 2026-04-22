const { generateSchemaFromExcel } = require("../services/schema.service");
const { resolvePath } = require("../utils/file");

function parseArgs(argv) {
  const flags = {};
  const positional = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) {
      positional.push(arg);
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

  return { flags, positional };
}

function getSchemaCommandHelpText() {
  return "Usage: shift-generator schema --input teams-export.xlsx --output schema.json";
}

function runGenerateSchemaCommand(argv) {
  if (argv.includes("-h") || argv.includes("--help")) {
    return { command: "help", helpText: getSchemaCommandHelpText() };
  }

  const { flags, positional } = parseArgs(argv);
  const inputValue = flags.input || positional[0];
  const outputValue = flags.output || positional[1];
  if (!inputValue || !outputValue) {
    if (!inputValue && !outputValue) {
      return { command: "help", helpText: getSchemaCommandHelpText() };
    }

    throw new Error(`Missing required arguments.\n${getSchemaCommandHelpText()}`);
  }

  const inputPath = resolvePath(inputValue);
  const outputPath = resolvePath(outputValue);

  const result = generateSchemaFromExcel({ inputPath, outputPath });
  return {
    command: "schema",
    inputPath: result.inputPath,
    outputPath: result.outputPath,
    groupCount: result.groupCount,
  };
}

module.exports = {
  runGenerateSchemaCommand,
};
