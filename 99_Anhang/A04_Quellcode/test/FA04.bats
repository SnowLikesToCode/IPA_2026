# FA04: Das Tool muss harte Bedingungen (z.B. Abwesenheiten) einhalten. Falls diese im automatischen Lauf nicht vollständig umgesetzt werden können, werden die betroffenen Schichten als `Open Shifts` ausgewiesen.
load "./helpers.sh"

@test "FA04A: Abwesenheiten als harte Bedingung werden eingehalten" {
  schema_file="$BATS_TEST_TMPDIR/fa04-schema-absence.json"
  output_file="$BATS_TEST_TMPDIR/fa04-plan-absence.xlsx"

  cat > "$schema_file" <<'JSON'
{
  "groups": {
    "Support": {
      "users": [
        {
          "member": "Alice",
          "workEmail": "alice@example.com",
          "absences": [{ "date": { "from": "2026-04-01", "to": "2026-04-01" }, "reason": "Vacation" }],
          "possibleShifts": ["Morning"]
        },
        {
          "member": "Bob",
          "workEmail": "bob@example.com",
          "absences": [],
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
          "activeDays": [3]
        }
      ]
    }
  }
}
JSON

  run_cli generate --schema "$schema_file" --from 2026-04-01 --to 2026-04-01 --output "$output_file"
  [ "$status" -eq 0 ]
  [[ "$output" == *"shifts=1"* ]]
  [[ "$output" == *"openShifts=0"* ]]

  run node -e "
    const xlsx = require('xlsx');
    const workbook = xlsx.readFile(process.argv[1]);
    const shifts = xlsx.utils.sheet_to_json(workbook.Sheets['Shifts'], { defval: null });
    if (shifts.length !== 1) {
      throw new Error('Expected exactly one assigned shift');
    }
    if (shifts[0]['Member'] !== 'Bob') {
      throw new Error('Expected Bob to be assigned because Alice is absent');
    }
  " "$output_file"
  [ "$status" -eq 0 ]
}

@test "FA04B: Wenn harte Bedingungen niemanden zulassen, wird Open Shift ausgewiesen" {
  schema_file="$BATS_TEST_TMPDIR/fa04-schema-open-shift.json"
  output_file="$BATS_TEST_TMPDIR/fa04-plan-open-shift.xlsx"

  cat > "$schema_file" <<'JSON'
{
  "groups": {
    "Support": {
      "users": [
        {
          "member": "Alice",
          "workEmail": "alice@example.com",
          "absences": [{ "date": { "from": "2026-04-01", "to": "2026-04-01" }, "reason": "Vacation" }],
          "possibleShifts": ["Morning"]
        },
        {
          "member": "Bob",
          "workEmail": "bob@example.com",
          "absences": [{ "date": { "from": "2026-04-01", "to": "2026-04-01" }, "reason": "Sick" }],
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
          "activeDays": [3]
        }
      ]
    }
  }
}
JSON

  run_cli generate --schema "$schema_file" --from 2026-04-01 --to 2026-04-01 --output "$output_file"
  [ "$status" -eq 0 ]
  [[ "$output" == *"shifts=0"* ]]
  [[ "$output" == *"openShifts=1"* ]]

  run node -e "
    const xlsx = require('xlsx');
    const workbook = xlsx.readFile(process.argv[1]);
    const openShifts = xlsx.utils.sheet_to_json(workbook.Sheets['Open Shifts'], { defval: null });
    if (openShifts.length !== 1) {
      throw new Error('Expected exactly one open shift');
    }
    if (openShifts[0]['Group'] !== 'Support') {
      throw new Error('Expected open shift in Support group');
    }
    if (openShifts[0]['Notes'] !== 'Morning') {
      throw new Error('Expected open shift for Morning');
    }
  " "$output_file"
  [ "$status" -eq 0 ]
}