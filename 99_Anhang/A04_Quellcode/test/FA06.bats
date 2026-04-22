# FA06: Das Tool muss pro Lauf einen Schichtplan als konsistenten Export erzeugen oder eine eindeutige Fehlermeldung liefern.

load "./helpers.sh"

@test "FA06A: Lauf erzeugt konsistenten Excel-Export mit allen erwarteten Sheets" {
  schema_file="$BATS_TEST_TMPDIR/fa06-schema-success.json"
  output_file="$BATS_TEST_TMPDIR/fa06-plan-success.xlsx"

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
  [ -f "$output_file" ]

  run node -e "
    const xlsx = require('xlsx');
    const workbook = xlsx.readFile(process.argv[1]);
    const expected = ['Shifts', 'Time Off', 'Open Shifts', 'Day Notes', 'Members'];
    if (JSON.stringify(workbook.SheetNames) !== JSON.stringify(expected)) {
      throw new Error('Unexpected sheet layout in export workbook');
    }
  " "$output_file"
  [ "$status" -eq 0 ]
}

@test "FA06B: Lauf liefert eindeutige Fehlermeldung bei ungültigem Schema" {
  schema_file="$BATS_TEST_TMPDIR/fa06-schema-invalid.json"
  output_file="$BATS_TEST_TMPDIR/fa06-plan-invalid.xlsx"

  cat > "$schema_file" <<'JSON'
{
  "invalid": true
}
JSON

  run_cli generate --schema "$schema_file" --from 2026-04-06 --to 2026-04-06 --output "$output_file"
  [ "$status" -eq 1 ]
  [[ "$output" == *"schema.groups is required"* ]]
}
