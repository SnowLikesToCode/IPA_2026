# FA05: Das Tool muss weiche Bedingungen (z.B. faire Verteilung) bestmöglich berücksichtigen und Zielkonflikte sichtbar machen.

load "./helpers.sh"

@test "FA05A: Faire Verteilung wird bestmöglich eingehalten" {
  schema_file="$BATS_TEST_TMPDIR/fa05-schema-fairness.json"
  output_file="$BATS_TEST_TMPDIR/fa05-plan-fairness.xlsx"

  cat > "$schema_file" <<'JSON'
{
  "groups": {
    "Support": {
      "users": [
        { "member": "Alice", "workEmail": "alice@example.com", "absences": [], "possibleShifts": ["Morning", "Evening"] },
        { "member": "Bob", "workEmail": "bob@example.com", "absences": [], "possibleShifts": ["Morning", "Evening"] }
      ],
      "shiftTypes": [
        {
          "name": "Morning",
          "start": "08:00",
          "end": "16:00",
          "themeColor": "1. White",
          "canBeDoubleBooked": false,
          "needed": true,
          "avoidAfter": [],
          "avoidDuring": [],
          "activeDays": [1, 2]
        },
        {
          "name": "Evening",
          "start": "16:00",
          "end": "22:00",
          "themeColor": "2. Gray",
          "canBeDoubleBooked": false,
          "needed": true,
          "avoidAfter": [],
          "avoidDuring": [],
          "activeDays": [1, 2]
        }
      ]
    }
  }
}
JSON

  run_cli generate --schema "$schema_file" --from 2026-04-06 --to 2026-04-07 --output "$output_file"
  [ "$status" -eq 0 ]
  [[ "$output" == *"shifts=4"* ]]
  [[ "$output" == *"openShifts=0"* ]]

  run node -e "
    const xlsx = require('xlsx');
    const workbook = xlsx.readFile(process.argv[1]);
    const shifts = xlsx.utils.sheet_to_json(workbook.Sheets['Shifts'], { defval: null });
    const counts = new Map();
    for (const shift of shifts) {
      counts.set(shift.Member, (counts.get(shift.Member) || 0) + 1);
    }
    if ((counts.get('Alice') || 0) !== 2) {
      throw new Error('Expected Alice to have 2 shifts');
    }
    if ((counts.get('Bob') || 0) !== 2) {
      throw new Error('Expected Bob to have 2 shifts');
    }
  " "$output_file"
  [ "$status" -eq 0 ]
}

@test "FA05B: Zielkonflikte werden im Trace-Logging sichtbar" {
  schema_file="$BATS_TEST_TMPDIR/fa05-schema-trace.json"
  output_file="$BATS_TEST_TMPDIR/fa05-plan-trace.xlsx"

  cat > "$schema_file" <<'JSON'
{
  "groups": {
    "Support": {
      "users": [
        {
          "member": "Alice",
          "workEmail": "alice@example.com",
          "absences": [{ "date": { "from": "2026-04-06", "to": "2026-04-06" }, "reason": "Vacation" }],
          "possibleShifts": ["Morning"]
        }
      ],
      "shiftTypes": [
        {
          "name": "Morning",
          "start": "08:00",
          "end": "16:00",
          "themeColor": "1. White",
          "canBeDoubleBooked": false,
          "needed": true,
          "avoidAfter": [],
          "avoidDuring": [],
          "activeDays": [1]
        }
      ]
    }
  }
}
JSON

  run_cli generate --schema "$schema_file" --from 2026-04-06 --to 2026-04-06 --output "$output_file" --trace
  [ "$status" -eq 0 ]
  [[ "$output" == *"[trace] blocked reasons:"* ]]
  [[ "$output" == *"user-absent="* ]]
  [[ "$output" == *"openShifts=1"* ]]
}
