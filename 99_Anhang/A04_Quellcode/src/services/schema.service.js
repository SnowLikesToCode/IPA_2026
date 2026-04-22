const { parseExcelExport } = require("../parsers/excel-export.parser");
const { writeSchema } = require("../parsers/schema.parser");

function createShiftName(shift) {
  if (shift.notes) {
    return shift.notes;
  }
  if (shift.customLabel) {
    return shift.customLabel;
  }
  return `${shift.startTime || "00:00"}-${shift.endTime || "00:00"}`;
}

function absenceKey(member, workEmail) {
  return `${member}__${workEmail}`.toLowerCase();
}

function sortByString(left, right) {
  return left.localeCompare(right, undefined, { sensitivity: "base" });
}

function getOrCreate(map, key, createValue) {
  if (!map.has(key)) {
    map.set(key, createValue());
  }
  return map.get(key);
}

function isoWeekday(isoDate) {
  if (!isoDate) {
    return null;
  }
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  const day = date.getUTCDay();
  return day === 0 ? 7 : day;
}

function buildAbsencesByUser(timeOff) {
  const absencesByUser = new Map();
  for (const item of timeOff) {
    const userKey = absenceKey(item.member, item.workEmail);
    const absences = getOrCreate(absencesByUser, userKey, () => []);
    absences.push({
      date: item.date,
      reason: item.reason,
    });
  }

  for (const absences of absencesByUser.values()) {
    absences.sort((left, right) => left.date.from.localeCompare(right.date.from));
  }
  return absencesByUser;
}

function createGroupEntry() {
  return {
    users: new Map(),
    shiftTypes: new Map(),
  };
}

function createUserEntry(shift, absencesByUser, userKey) {
  return {
    member: shift.member,
    workEmail: shift.workEmail,
    absences: absencesByUser.get(userKey) || [],
    possibleShifts: new Set(),
  };
}

function createShiftTypeEntry(shift, shiftName) {
  return {
    name: shiftName,
    start: shift.startTime || "00:00",
    end: shift.endTime || "00:00",
    themeColor: shift.themeColor || "1. White",
    canBeDoubleBooked: false,
    needed: true,
    avoidAfter: [],
    avoidDuring: [],
    activeDays: new Set(),
  };
}

function addShiftToGroups(groups, shift, absencesByUser) {
  const groupEntry = getOrCreate(groups, shift.group, createGroupEntry);
  const userKey = absenceKey(shift.member, shift.workEmail);
  const shiftName = createShiftName(shift);
  const userEntry = getOrCreate(groupEntry.users, userKey, () =>
    createUserEntry(shift, absencesByUser, userKey),
  );
  userEntry.possibleShifts.add(shiftName);

  const shiftTypeKey = `${shiftName}__${shift.startTime}__${shift.endTime}`;
  const shiftTypeEntry = getOrCreate(groupEntry.shiftTypes, shiftTypeKey, () =>
    createShiftTypeEntry(shift, shiftName),
  );
  const weekday = isoWeekday(shift.startDate);
  if (weekday) {
    shiftTypeEntry.activeDays.add(weekday);
  }
}

function serializeUsers(usersMap) {
  return Array.from(usersMap.values())
    .map((user) => ({
      member: user.member,
      workEmail: user.workEmail,
      absences: user.absences,
      possibleShifts: Array.from(user.possibleShifts).sort(sortByString),
    }))
    .sort((left, right) => sortByString(left.member, right.member));
}

function serializeShiftTypes(shiftTypesMap) {
  return Array.from(shiftTypesMap.values())
    .map((shiftType) => ({
      ...shiftType,
      activeDays:
        shiftType.activeDays.size > 0
          ? Array.from(shiftType.activeDays).sort((left, right) => left - right)
          : [1, 2, 3, 4, 5],
    }))
    .sort((left, right) => {
      if (left.name !== right.name) {
        return sortByString(left.name, right.name);
      }
      if (left.start !== right.start) {
        return sortByString(left.start, right.start);
      }
      return sortByString(left.end, right.end);
    });
}

function buildSchema(parsedWorkbook) {
  const absencesByUser = buildAbsencesByUser(parsedWorkbook.timeOff);
  const groups = new Map();

  for (const shift of parsedWorkbook.shifts) {
    addShiftToGroups(groups, shift, absencesByUser);
  }

  const groupsObject = {};
  for (const groupName of Array.from(groups.keys()).sort(sortByString)) {
    const groupData = groups.get(groupName);
    groupsObject[groupName] = {
      users: serializeUsers(groupData.users),
      shiftTypes: serializeShiftTypes(groupData.shiftTypes),
    };
  }

  return { groups: groupsObject };
}

function generateSchemaFromExcel({ inputPath, outputPath }) {
  const parsedWorkbook = parseExcelExport(inputPath);
  const schema = buildSchema(parsedWorkbook);
  writeSchema(outputPath, schema);
  return {
    inputPath,
    outputPath,
    schema,
    groupCount: Object.keys(schema.groups).length,
  };
}

module.exports = {
  generateSchemaFromExcel,
  buildSchema,
};
