# FA07: Nach jedem Lauf muss ersichtlich sein, ob die Planung erfolgreich war, welche Vorgaben erfüllt wurden und welche verletzt sind; verletzte Vorgaben müssen im Laufresultat eindeutig sichtbar und über die ausgewiesenen `Open Shifts` nachvollziehbar sein.

load "./helpers.sh"

@test "FA07A: Laufresultat zeigt erfolgreiche Planung mit Kennzahlen" {
  schema_file="$BATS_TEST_TMPDIR/fa07-schema-success.json"
  output_file="$BATS_TEST_TMPDIR/fa07-plan-success.xlsx"

  cat > "$schema_file" <<'JSON'
{
  "groups": {
    "Support": {
      "users": [
        { "member": "Alice", "workEmail": "alice@example.com", "absences": [], "possibleShifts": ["Morning"] }
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

  run_cli generate --schema "$schema_file" --from 2026-04-06 --to 2026-04-06 --output "$output_file"
  [ "$status" -eq 0 ]
  [[ "$output" == *"Generated"* ]]
  [[ "$output" == *"shifts=1"* ]]
  [[ "$output" == *"openShifts=0"* ]]
  [[ "$output" == *"timeOff=0"* ]]
}

@test "FA07B: Verletzte Vorgaben sind über Open Shifts nachvollziehbar" {
  schema_file="$BATS_TEST_TMPDIR/fa07-schema-open-shift.json"
  output_file="$BATS_TEST_TMPDIR/fa07-plan-open-shift.xlsx"

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

  run_cli generate --schema "$schema_file" --from 2026-04-06 --to 2026-04-06 --output "$output_file"
  [ "$status" -eq 0 ]
  [[ "$output" == *"shifts=0"* ]]
  [[ "$output" == *"openShifts=1"* ]]
  [[ "$output" == *"timeOff=1"* ]]

  run node -e "
    const xlsx = require('xlsx');
    const workbook = xlsx.readFile(process.argv[1]);
    const rows = xlsx.utils.sheet_to_json(workbook.Sheets['Open Shifts'], { defval: null });
    if (rows.length !== 1) {
      throw new Error('Expected one open shift entry');
    }
    if (rows[0]['Group'] !== 'Support' || rows[0]['Notes'] !== 'Morning') {
      throw new Error('Open shift entry does not match expected violated shift');
    }
  " "$output_file"
  [ "$status" -eq 0 ]
}
