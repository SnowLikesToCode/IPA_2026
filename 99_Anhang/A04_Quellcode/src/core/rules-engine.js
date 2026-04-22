const { addDays } = require("../utils/date");

function isAbsent(user, date) {
  if (!Array.isArray(user.absences)) {
    return false;
  }
  return user.absences.some((absence) => absence.date.from <= date && date <= absence.date.to);
}

function assignmentKey(member, workEmail) {
  return `${member}__${workEmail}`.toLowerCase();
}

function hasBlockedHistory(historyByUser, userKey, blockedShiftNames, currentDate, lookbackDays) {
  if (!blockedShiftNames || blockedShiftNames.length === 0) {
    return false;
  }
  const history = historyByUser.get(userKey) || [];
  const lookbackStart = addDays(currentDate, -Math.max(lookbackDays, 0));
  for (const previous of history) {
    if (previous.date >= lookbackStart && previous.date < currentDate) {
      if (blockedShiftNames.includes(previous.shiftName)) {
        return true;
      }
    }
  }
  return false;
}

function canAssignWithExistingShifts(existingShifts, incomingShiftCanBeDoubleBooked) {
  if (!existingShifts || existingShifts.length === 0) {
    return true;
  }
  if (incomingShiftCanBeDoubleBooked) {
    return true;
  }
  return existingShifts.every((item) => item.canBeDoubleBooked === true);
}

function hasDuringConflict(existingShifts, incomingShiftName, incomingAvoidDuring) {
  if (!existingShifts || existingShifts.length === 0) {
    return false;
  }
  const incomingBlocked = Array.isArray(incomingAvoidDuring) ? incomingAvoidDuring : [];
  return existingShifts.some((item) => {
    const existingBlocked = Array.isArray(item.avoidDuring) ? item.avoidDuring : [];
    return incomingBlocked.includes(item.shiftName) || existingBlocked.includes(incomingShiftName);
  });
}

function getRotationKey(groupName, shiftType) {
  return `${groupName}__${shiftType.name}__${shiftType.start}__${shiftType.end}`;
}

function getRotationState(rotationByShift, key) {
  if (!rotationByShift.has(key)) {
    rotationByShift.set(key, {
      currentUserKey: null,
      streakCount: 0,
      cooldownByUser: new Map(),
    });
  }
  return rotationByShift.get(key);
}

function isInCooldown(rotationState, userKey) {
  return (rotationState.cooldownByUser.get(userKey) || 0) > 0;
}

function decrementCooldowns(rotationState) {
  for (const [userKey, remaining] of rotationState.cooldownByUser.entries()) {
    if (remaining <= 1) {
      rotationState.cooldownByUser.delete(userKey);
      continue;
    }
    rotationState.cooldownByUser.set(userKey, remaining - 1);
  }
}

function getRotationWindowForShift(shiftType) {
  if (Array.isArray(shiftType.activeDays) && shiftType.activeDays.length > 0) {
    return Math.max(1, shiftType.activeDays.length);
  }
  return 5;
}

function createUserCandidate(user) {
  return {
    ...user,
    key: assignmentKey(user.member, user.workEmail),
  };
}

function evaluateUserEligibility({
  user,
  shiftType,
  date,
  rotationWindow,
  rotationState,
  requiredUserKey,
  assignedToday,
  historyByUser,
}) {
  const reasons = [];
  if (!(Array.isArray(user.possibleShifts) && user.possibleShifts.includes(shiftType.name))) {
    reasons.push("shift-not-in-possibleShifts");
  }
  if (isAbsent(user, date)) {
    reasons.push("user-absent");
  }

  const existingShiftsForUser = assignedToday.get(user.key) || [];
  if (hasDuringConflict(existingShiftsForUser, shiftType.name, shiftType.avoidDuring)) {
    reasons.push("during-conflict");
  }
  if (!canAssignWithExistingShifts(existingShiftsForUser, shiftType.canBeDoubleBooked)) {
    reasons.push("double-booking-not-allowed");
  }
  if (
    hasBlockedHistory(
      historyByUser,
      user.key,
      Array.isArray(shiftType.avoidAfter) ? shiftType.avoidAfter : [],
      date,
      rotationWindow,
    )
  ) {
    reasons.push("avoidAfter-block");
  }
  if (isInCooldown(rotationState, user.key)) {
    reasons.push("rotation-cooldown");
  }
  if (requiredUserKey && user.key !== requiredUserKey) {
    reasons.push("rotation-continuity-enforced");
  }

  return reasons;
}

function pickLeastAssigned(candidates, assignmentCounts) {
  const sorted = [...candidates].sort((left, right) => {
    const leftCount = assignmentCounts.get(left.key) || 0;
    const rightCount = assignmentCounts.get(right.key) || 0;
    if (leftCount !== rightCount) {
      return leftCount - rightCount;
    }
    if (left.member !== right.member) {
      return left.member.localeCompare(right.member, undefined, { sensitivity: "base" });
    }
    return left.workEmail.localeCompare(right.workEmail, undefined, { sensitivity: "base" });
  });
  return sorted[0] || null;
}

function updateRotationAfterAssignment(rotationState, picked, rotationWindow) {
  if (!rotationState.currentUserKey) {
    rotationState.currentUserKey = picked.key;
    rotationState.streakCount = 1;
  } else if (rotationState.currentUserKey === picked.key) {
    rotationState.streakCount += 1;
  }

  if (rotationState.currentUserKey === picked.key && rotationState.streakCount >= rotationWindow) {
    rotationState.cooldownByUser.set(picked.key, rotationWindow + 1);
    rotationState.currentUserKey = null;
    rotationState.streakCount = 0;
  }
}

module.exports = {
  createUserCandidate,
  evaluateUserEligibility,
  pickLeastAssigned,
  getRotationWindowForShift,
  getRotationKey,
  getRotationState,
  decrementCooldowns,
  updateRotationAfterAssignment,
};
