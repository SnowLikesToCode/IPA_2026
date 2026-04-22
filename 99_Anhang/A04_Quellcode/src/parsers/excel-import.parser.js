const xlsx = require("xlsx");
const { formatDateForTeams } = require("../utils/date");

const SHEETS = {
  SHIFTS: "Shifts",
  TIME_OFF: "Time Off",
  OPEN_SHIFTS: "Open Shifts",
  DAY_NOTES: "Day Notes",
  MEMBERS: "Members",
};

const HEADERS = {
  SHIFTS: [
    "Member",
    "Work Email",
    "Group",
    "Start Date",
    "Start Time",
    "End Date",
    "End Time",
    "Theme Color",
    "Custom Label",
    "Unpaid Break (minutes)",
    "Notes",
    "Shared",
  ],
  TIME_OFF: [
    "Member",
    "Work Email",
    "Start Date",
    "Start Time",
    "End Date",
    "End Time",
    "Time Off Reason",
    "Theme Color",
    "Notes",
    "Shared",
  ],
  OPEN_SHIFTS: [
    "Group",
    "Start Date",
    "Start Time",
    "End Date",
    "End Time",
    "Open Slots",
    "Theme Color",
    "Custom Label",
    "Unpaid Break (minutes)",
    "Notes",
    "Shared",
  ],
  DAY_NOTES: ["Date", "Note"],
  MEMBERS: ["Member", "Work Email"],
};

const TEAMS_DEFAULTS = {
  shifts: {
    themeColor: "1. White",
    customLabel: null,
    unpaidBreakMinutes: null,
    notes: null,
    shared: "1. Shared",
  },
  timeOff: {
    startTime: "00:00",
    endTime: "23:59",
    themeColor: "1. White",
    notes: null,
    shared: "1. Shared",
  },
  openShifts: {
    openSlots: 1,
    themeColor: "1. White",
    customLabel: null,
    unpaidBreakMinutes: null,
    notes: null,
    shared: "1. Shared",
  },
  dayNotes: [],
};

function sortString(a, b) {
  return a.localeCompare(b, undefined, { sensitivity: "base" });
}

function collectUniqueUsers(schema) {
  const usersByKey = new Map();
  for (const group of Object.values(schema.groups || {})) {
    for (const user of group.users || []) {
      const userKey = `${user.member}__${user.workEmail}`.toLowerCase();
      if (!usersByKey.has(userKey)) {
        usersByKey.set(userKey, { member: user.member, workEmail: user.workEmail });
      }
    }
  }
  return Array.from(usersByKey.values()).sort((a, b) => sortString(a.member, b.member));
}

function rowsToSheet(headers, rows) {
  return xlsx.utils.json_to_sheet(rows, { header: headers, skipHeader: false });
}

function buildShiftRows(shifts) {
  return shifts.map((shift) => ({
    Member: shift.member,
    "Work Email": shift.workEmail,
    Group: shift.group,
    "Start Date": formatDateForTeams(shift.startDate),
    "Start Time": shift.startTime,
    "End Date": formatDateForTeams(shift.endDate),
    "End Time": shift.endTime,
    "Theme Color": shift.themeColor || TEAMS_DEFAULTS.shifts.themeColor,
    "Custom Label": TEAMS_DEFAULTS.shifts.customLabel,
    "Unpaid Break (minutes)": TEAMS_DEFAULTS.shifts.unpaidBreakMinutes,
    Notes: TEAMS_DEFAULTS.shifts.notes ?? shift.shiftName,
    Shared: TEAMS_DEFAULTS.shifts.shared,
  }));
}

function buildTimeOffRows(timeOff) {
  return timeOff.map((item) => ({
    Member: item.member,
    "Work Email": item.workEmail,
    "Start Date": formatDateForTeams(item.startDate),
    "Start Time": TEAMS_DEFAULTS.timeOff.startTime,
    "End Date": formatDateForTeams(item.endDate),
    "End Time": TEAMS_DEFAULTS.timeOff.endTime,
    "Time Off Reason": item.reason,
    "Theme Color": TEAMS_DEFAULTS.timeOff.themeColor,
    Notes: TEAMS_DEFAULTS.timeOff.notes,
    Shared: TEAMS_DEFAULTS.timeOff.shared,
  }));
}

function buildOpenShiftRows(openShifts) {
  return openShifts.map((item) => ({
    Group: item.group,
    "Start Date": formatDateForTeams(item.startDate),
    "Start Time": item.startTime,
    "End Date": formatDateForTeams(item.endDate),
    "End Time": item.endTime,
    "Open Slots": TEAMS_DEFAULTS.openShifts.openSlots,
    "Theme Color": item.themeColor || TEAMS_DEFAULTS.openShifts.themeColor,
    "Custom Label": TEAMS_DEFAULTS.openShifts.customLabel,
    "Unpaid Break (minutes)": TEAMS_DEFAULTS.openShifts.unpaidBreakMinutes,
    Notes: TEAMS_DEFAULTS.openShifts.notes ?? item.shiftName,
    Shared: TEAMS_DEFAULTS.openShifts.shared,
  }));
}

function buildWorkbookData({ schema, generated }) {
  const users = collectUniqueUsers(schema);
  const memberRows = users.map((user) => ({
    Member: user.member,
    "Work Email": user.workEmail,
  }));

  return {
    [SHEETS.SHIFTS]: rowsToSheet(HEADERS.SHIFTS, buildShiftRows(generated.shifts)),
    [SHEETS.TIME_OFF]: rowsToSheet(HEADERS.TIME_OFF, buildTimeOffRows(generated.timeOff)),
    [SHEETS.OPEN_SHIFTS]: rowsToSheet(HEADERS.OPEN_SHIFTS, buildOpenShiftRows(generated.openShifts)),
    [SHEETS.DAY_NOTES]: rowsToSheet(HEADERS.DAY_NOTES, []),
    [SHEETS.MEMBERS]: rowsToSheet(HEADERS.MEMBERS, memberRows),
  };
}

function writePlanWorkbook({ schema, generated, outputPath }) {
  const workbook = xlsx.utils.book_new();
  const workbookData = buildWorkbookData({ schema, generated });
  const sheetOrder = [
    SHEETS.SHIFTS,
    SHEETS.TIME_OFF,
    SHEETS.OPEN_SHIFTS,
    SHEETS.DAY_NOTES,
    SHEETS.MEMBERS,
  ];

  for (const name of sheetOrder) {
    xlsx.utils.book_append_sheet(workbook, workbookData[name], name);
  }
  xlsx.writeFile(workbook, outputPath);
}

module.exports = {
  writePlanWorkbook,
  buildWorkbookData,
};
