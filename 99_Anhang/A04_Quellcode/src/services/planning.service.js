const { generatePlan } = require("../core/planner");
const { validateDateRange, validateSchema } = require("../core/validator");
const { writePlanWorkbook } = require("../parsers/excel-import.parser");
const { readSchema } = require("../parsers/schema.parser");
const { formatDuration, nowMs } = require("../utils/date");

function generatePlanningWorkbook({ schemaPath, from, to, outputPath, verbose = false, trace = false, logger }) {
  validateDateRange(from, to);

  const startedAtMs = nowMs();
  const schema = readSchema(schemaPath);
  validateSchema(schema);
  const afterReadMs = nowMs();

  const generated = generatePlan({ schema, from, to });
  const afterGenerateMs = nowMs();

  writePlanWorkbook({ schema, generated, outputPath });
  const afterWriteMs = nowMs();

  const timing = {
    readMs: afterReadMs - startedAtMs,
    generateMs: afterGenerateMs - afterReadMs,
    writeMs: afterWriteMs - afterGenerateMs,
    totalMs: afterWriteMs - startedAtMs,
  };

  if (verbose || trace) {
    logger.info(`[verbose] read schema: ${formatDuration(timing.readMs)}`);
    logger.info(`[verbose] generation: ${formatDuration(timing.generateMs)}`);
    logger.info(`[verbose] workbook write: ${formatDuration(timing.writeMs)}`);
    logger.info(`[verbose] total: ${formatDuration(timing.totalMs)}`);
  }

  if (trace && generated.traceSummary.reasonBreakdown.length > 0) {
    logger.info(
      `[trace] blocked reasons: ${generated.traceSummary.reasonBreakdown
        .map((item) => `${item.reason}=${item.count}`)
        .join(", ")}`,
    );
  }

  return {
    outputPath,
    shifts: generated.shifts.length,
    openShifts: generated.openShifts.length,
    timeOff: generated.timeOff.length,
    timing,
  };
}

module.exports = {
  generatePlanningWorkbook,
};
