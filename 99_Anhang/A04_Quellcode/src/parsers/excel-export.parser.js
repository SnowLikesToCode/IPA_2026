const xlsx = require("xlsx");

function isBlank(value) {
  return value === null || value === undefined || value === "";
}

function toTrimmedString(value) {
  return String(value).trim();
}

function getRequiredTrimmed(row, key) {
  const value = toTrimmedString(row[key] || "");
  return value || null;
}

function getOptionalTrimmed(row, key, fallback = "") {
  if (!row[key]) {
    return fallback;
  }
  return toTrimmedString(row[key]);
}

function formatIsoParts(year, month, day) {
  const paddedYear = String(year).padStart(4, "0");
  const paddedMonth = String(month).padStart(2, "0");
  const paddedDay = String(day).padStart(2, "0");
  return `${paddedYear}-${paddedMonth}-${paddedDay}`;
}

function parseExcelDateNumber(value) {
  if (typeof value !== "number") {
    return null;
  }
  const parsed = xlsx.SSF.parse_date_code(value);
  if (!parsed) {
    return null;
  }
  return formatIsoParts(parsed.y, parsed.m, parsed.d);
}

function parseSlashDateString(value) {
  const slashMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!slashMatch) {
    return null;
  }
  const [, month, day, year] = slashMatch;
  return formatIsoParts(year, month, day);
}

function parseHyphenDateString(value) {
  const hyphenMatch = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!hyphenMatch) {
    return null;
  }
  const [, year, month, day] = hyphenMatch;
  return formatIsoParts(year, month, day);
}

function parseNativeDateString(value) {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }
  return parsedDate.toISOString().slice(0, 10);
}

function toIsoDate(value) {
  if (isBlank(value)) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  const parsedExcelDate = parseExcelDateNumber(value);
  if (parsedExcelDate) {
    return parsedExcelDate;
  }

  const asString = toTrimmedString(value);
  if (!asString) {
    return null;
  }

  const parsedSlashDate = parseSlashDateString(asString);
  if (parsedSlashDate) {
    return parsedSlashDate;
  }

  const parsedHyphenDate = parseHyphenDateString(asString);
  if (parsedHyphenDate) {
    return parsedHyphenDate;
  }

  return parseNativeDateString(asString);
}

function toTime(value) {
  if (isBlank(value)) {
    return null;
  }

  if (typeof value === "number") {
    const totalMinutes = Math.round(value * 24 * 60) % (24 * 60);
    const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
    const minutes = String(totalMinutes % 60).padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  const asString = toTrimmedString(value);
  if (!asString) {
    return null;
  }

  const timeMatch = asString.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (timeMatch) {
    const [, hours, minutes] = timeMatch;
    return `${hours.padStart(2, "0")}:${minutes}`;
  }

  return asString;
}

function parseSheet(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    return [];
  }
  return xlsx.utils.sheet_to_json(sheet, {
    defval: null,
    raw: true,
    blankrows: false,
  });
}

function normalizeShift(row) {
  const member = getRequiredTrimmed(row, "Member");
  const workEmail = getRequiredTrimmed(row, "Work Email");
  const group = getRequiredTrimmed(row, "Group");
  if (!member || !workEmail || !group) {
    return null;
  }

  return {
    member,
    workEmail,
    group,
    startDate: toIsoDate(row["Start Date"]),
    endDate: toIsoDate(row["End Date"]),
    startTime: toTime(row["Start Time"]),
    endTime: toTime(row["End Time"]),
    themeColor: getOptionalTrimmed(row, "Theme Color"),
    notes: getOptionalTrimmed(row, "Notes"),
    customLabel: getOptionalTrimmed(row, "Custom Label"),
  };
}

function normalizeTimeOff(row) {
  const member = getRequiredTrimmed(row, "Member");
  const workEmail = getRequiredTrimmed(row, "Work Email");
  if (!member || !workEmail) {
    return null;
  }

  const from = toIsoDate(row["Start Date"]);
  const to = toIsoDate(row["End Date"]);
  if (!from || !to) {
    return null;
  }

  return {
    member,
    workEmail,
    date: { from, to },
    reason: getOptionalTrimmed(row, "Time Off Reason", "Unknown"),
  };
}

function parseExcelExport(inputPath) {
  const workbook = xlsx.readFile(inputPath, { cellDates: true });
  const shifts = parseSheet(workbook, "Shifts").map(normalizeShift).filter(Boolean);
  const timeOff = parseSheet(workbook, "Time Off").map(normalizeTimeOff).filter(Boolean);
  return { shifts, timeOff };
}

module.exports = {
  parseExcelExport,
  toIsoDate,
  toTime,
};
