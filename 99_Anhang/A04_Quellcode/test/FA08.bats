# FA08: Das Logging muss in der Granularität steuerbar sein (z.B. Standard, Verbose, Trace) und die Laufdauer ausweisen (ms).

load "./helpers.sh"

@test "FA08A: Standard-Logging zeigt nur Ergebnis ohne Verbose/Trace-Details" {
  schema_file="$BATS_TEST_TMPDIR/fa08-schema-standard.json"
  output_file="$BATS_TEST_TMPDIR/fa08-plan-standard.xlsx"

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
  [[ "$output" != *"[verbose]"* ]]
  [[ "$output" != *"[trace]"* ]]
}

@test "FA08B: Verbose-Logging zeigt Laufdauer in ms" {
  schema_file="$BATS_TEST_TMPDIR/fa08-schema-verbose.json"
  output_file="$BATS_TEST_TMPDIR/fa08-plan-verbose.xlsx"

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

  run_cli generate --schema "$schema_file" --from 2026-04-06 --to 2026-04-06 --output "$output_file" --verbose
  [ "$status" -eq 0 ]
  [[ "$output" == *"[verbose] read schema:"* ]]
  [[ "$output" == *"[verbose] generation:"* ]]
  [[ "$output" == *"[verbose] workbook write:"* ]]
  [[ "$output" == *"[verbose] total:"* ]]
  [[ "$output" == *"ms"* ]]
}

@test "FA08C: Trace-Logging erweitert Verbose um Constraint-Analyse" {
  schema_file="$BATS_TEST_TMPDIR/fa08-schema-trace.json"
  output_file="$BATS_TEST_TMPDIR/fa08-plan-trace.xlsx"

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
  [[ "$output" == *"[verbose] total:"* ]]
  [[ "$output" == *"[trace] blocked reasons:"* ]]
  [[ "$output" == *"user-absent="* ]]
}
