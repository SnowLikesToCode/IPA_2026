---
title: "Quellcode & commit History"
weight: 4
---

In diesem Abschnitt werden die wichtigsten Teile des Quellcodes präsentiert. Der vollständige Quellcode (A01_Quellcode) sowie ein commit History (A03_Git-Log.txt) befindet sich im Anhang.

Die wichtigsten Auszüge:

```schema.json
{
  "groups": {
    "Developers": {
      "users": [
        {
          "member": "Lins Isaac, GHR-SCS-NEX-INP-10",
          "workEmail": "Isaac.Lins@swisscom.com",
          "absences": [
            {
              "date": {
                "from": "2026-03-23",
                "to": "2026-03-27"
              },
              "reason": "Vacation"
            }
          ],
          "possibleShifts": ["Janitor shift", "Senior Dev"]
        }
      ],
      "shiftTypes": [
        {
          "name": "Janitor shift",
          "start": "08:00",
          "end": "17:00",
          "needed": true,
          "activeDays": [1, 2, 3, 4, 5]
        }
      ]
    }
  }
}
```

```FA01.bats
load "./helpers.sh"

@test "FA01A: Lokal ausführbar" {
  run_cli --help
  [ "$status" -eq 0 ]
  [[ "$output" == *"Usage:"* ]]
}
```

```planner.js
function generatePlan({ schema, from, to }) {
  const groups = schema.groups || {};
  const days = dateRange(from, to);
  const shifts = [];
  const openShifts = [];

  for (const date of days) {
    for (const [groupName, group] of Object.entries(groups)) {
      const users = Array.isArray(group.users) ? group.users : [];
      const activeShiftTypes = getActiveShiftTypes(group, date);
      const shiftTypes = orderShiftTypesByPriority(activeShiftTypes);

      for (const shiftType of shiftTypes) {
        const candidates = users.map(createUserCandidate).filter((user) => {
          const reasons = evaluateUserEligibility({ user, shiftType, date });
          return reasons.length === 0;
        });

        const picked = pickLeastAssigned(candidates, assignmentCounts);
        if (picked) {
          shifts.push(buildAssignedShift({ picked, groupName, date, shiftType }));
        } else if (shiftType.needed !== false) {
          openShifts.push(buildOpenShift({ groupName, date, shiftType }));
        }
      }
    }
  }

  return { shifts, openShifts };
}
```
