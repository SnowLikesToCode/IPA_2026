function isIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function validateDateRange(from, to) {
  if (!from || !to) {
    throw new Error("Both --from and --to are required, e.g. --from 2026-04-01 --to 2026-04-30");
  }
  if (!isIsoDate(from) || !isIsoDate(to)) {
    throw new Error("Dates must use YYYY-MM-DD format.");
  }
  if (from > to) {
    throw new Error("'from' must be before or equal to 'to'");
  }
}

function validateSchema(schema) {
  if (!schema || typeof schema !== "object") {
    throw new Error("schema is required");
  }
  if (!schema.groups || typeof schema.groups !== "object") {
    throw new Error("schema.groups is required");
  }
}

module.exports = {
  validateDateRange,
  validateSchema,
};
