const { addDays, dateRange, getIsoWeekday } = require("../utils/date");
const {
  createUserCandidate,
  evaluateUserEligibility,
  pickLeastAssigned,
  getRotationWindowForShift,
  getRotationKey,
  getRotationState,
  decrementCooldowns,
  updateRotationAfterAssignment,
} = require("./rules-engine");

function isShiftActiveOnDate(shiftType, date) {
  const activeDays =
    Array.isArray(shiftType.activeDays) && shiftType.activeDays.length > 0
      ? shiftType.activeDays
      : [1, 2, 3, 4, 5];
  return activeDays.includes(getIsoWeekday(date));
}

function getActiveShiftTypes(group, date) {
  const shiftTypes = Array.isArray(group.shiftTypes) ? group.shiftTypes : [];
  return shiftTypes.filter((shiftType) => isShiftActiveOnDate(shiftType, date));
}

function orderShiftTypesByPriority(activeShiftTypes) {
  const requiredShiftTypes = activeShiftTypes.filter(
    (shiftType) => shiftType.needed !== false,
  );
  const optionalShiftTypes = activeShiftTypes.filter(
    (shiftType) => shiftType.needed === false,
  );
  return [...requiredShiftTypes, ...optionalShiftTypes];
}

function getDateAssignments(assignedByDate, dateKey) {
  return assignedByDate.get(dateKey) || new Map();
}

function buildAssignedShift({ picked, groupName, date, shiftType }) {
  return {
    member: picked.member,
    workEmail: picked.workEmail,
    group: groupName,
    startDate: date,
    startTime: shiftType.start,
    endDate: shiftType.end < shiftType.start ? addDays(date, 1) : date,
    endTime: shiftType.end,
    shiftName: shiftType.name,
    themeColor: shiftType.themeColor || "1. White",
  };
}

function addAssignedShiftForDate(assignedToday, picked, shiftType) {
  const existingShiftsForUser = assignedToday.get(picked.key) || [];
  existingShiftsForUser.push({
    shiftName: shiftType.name,
    canBeDoubleBooked: !!shiftType.canBeDoubleBooked,
    avoidDuring: Array.isArray(shiftType.avoidDuring)
      ? shiftType.avoidDuring
      : [],
  });
  assignedToday.set(picked.key, existingShiftsForUser);
}

function updateUserAssignmentHistory(
  assignmentCounts,
  historyByUser,
  picked,
  date,
  shiftType,
) {
  assignmentCounts.set(picked.key, (assignmentCounts.get(picked.key) || 0) + 1);
  const history = historyByUser.get(picked.key) || [];
  history.push({ date, shiftName: shiftType.name });
  historyByUser.set(picked.key, history);
}

function buildOpenShift({ groupName, date, shiftType }) {
  return {
    group: groupName,
    startDate: date,
    startTime: shiftType.start,
    endDate: shiftType.end < shiftType.start ? addDays(date, 1) : date,
    endTime: shiftType.end,
    shiftName: shiftType.name,
    themeColor: shiftType.themeColor || "1. White",
    reason: "No eligible user (constraints/availability/rules)",
  };
}

function overlapsRange(absenceFrom, absenceTo, from, to) {
  return absenceFrom <= to && absenceTo >= from;
}

function collectTimeOffInRange(groups, from, to) {
  const timeOff = [];
  for (const group of Object.values(groups)) {
    for (const user of group.users || []) {
      for (const absence of user.absences || []) {
        const absenceFrom = absence.date?.from;
        const absenceTo = absence.date?.to;
        if (!absenceFrom || !absenceTo) {
          continue;
        }
        if (!overlapsRange(absenceFrom, absenceTo, from, to)) {
          continue;
        }

        const clippedFrom = absenceFrom < from ? from : absenceFrom;
        const clippedTo = absenceTo > to ? to : absenceTo;
        timeOff.push({
          member: user.member,
          workEmail: user.workEmail,
          startDate: clippedFrom,
          endDate: clippedTo,
          reason: absence.reason,
        });
      }
    }
  }
  return timeOff;
}

function generatePlan({ schema, from, to }) {
  const groups = schema.groups || {};
  const days = dateRange(from, to);
  const shifts = [];
  const openShifts = [];
  const assignmentCounts = new Map();
  const historyByUser = new Map();
  const assignedByDate = new Map();
  const rotationByShift = new Map();
  const reasonCounts = new Map();

  for (const date of days) {
    for (const [groupName, group] of Object.entries(groups)) {
      const users = Array.isArray(group.users) ? group.users : [];
      const activeShiftTypes = getActiveShiftTypes(group, date);
      const shiftTypes = orderShiftTypesByPriority(activeShiftTypes);

      for (const shiftType of shiftTypes) {
        const rotationWindow = getRotationWindowForShift(shiftType);
        const dateKey = `${groupName}__${date}`;
        const assignedToday = getDateAssignments(assignedByDate, dateKey);
        const rotationState = getRotationState(
          rotationByShift,
          getRotationKey(groupName, shiftType),
        );

        if (
          rotationState.currentUserKey &&
          rotationState.streakCount >= rotationWindow
        ) {
          rotationState.currentUserKey = null;
          rotationState.streakCount = 0;
        }

        const requiredUserKey =
          rotationState.currentUserKey &&
          rotationState.streakCount < rotationWindow
            ? rotationState.currentUserKey
            : null;

        const candidates = users.map(createUserCandidate).filter((user) => {
          const reasons = evaluateUserEligibility({
            user,
            shiftType,
            date,
            rotationWindow,
            rotationState,
            requiredUserKey,
            assignedToday,
            historyByUser,
          });
          if (reasons.length > 0) {
            for (const reason of reasons) {
              reasonCounts.set(reason, (reasonCounts.get(reason) || 0) + 1);
            }
            return false;
          }
          return true;
        });

        const picked = pickLeastAssigned(candidates, assignmentCounts);
        if (picked) {
          shifts.push(
            buildAssignedShift({ picked, groupName, date, shiftType }),
          );
          addAssignedShiftForDate(assignedToday, picked, shiftType);
          assignedByDate.set(dateKey, assignedToday);
          updateUserAssignmentHistory(
            assignmentCounts,
            historyByUser,
            picked,
            date,
            shiftType,
          );
          updateRotationAfterAssignment(rotationState, picked, rotationWindow);
        } else if (shiftType.needed !== false) {
          openShifts.push(buildOpenShift({ groupName, date, shiftType }));
        }

        decrementCooldowns(rotationState);
      }
    }
  }

  const timeOff = collectTimeOffInRange(groups, from, to);
  const reasonBreakdown = Array.from(reasonCounts.entries())
    .sort((left, right) => right[1] - left[1])
    .map(([reason, count]) => ({ reason, count }));

  return {
    shifts,
    openShifts,
    timeOff,
    traceSummary: {
      reasonBreakdown,
    },
  };
}

module.exports = {
  generatePlan,
};
