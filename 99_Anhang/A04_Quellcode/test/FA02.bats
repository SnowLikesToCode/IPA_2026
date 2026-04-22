# FA02: Das Tool muss über die Kommandozeile aufrufbar sein und Pflicht- sowie optionale Parameter verarbeiten.
load "./helpers.sh"

@test "FA02A: CLI-Hilfe ist aufrufbar" {
  run_cli --help
  [ "$status" -eq 0 ]
  [[ "$output" == *"Usage:"* ]]
}

@test "FA02B: schema-Befehl ohne Argumente zeigt Hilfe" {
  run_cli schema
  [ "$status" -eq 0 ]
  [[ "$output" == *"shift-generator schema"* ]]
}

@test "FA02C: schema-Befehl schlägt bei unvollständigen Pflichtparametern fehl" {
  run_cli schema --input FA02.test.xlsx
  [ "$status" -eq 1 ]
  [[ "$output" == *"Missing required arguments."* ]]
}

@test "FA02D: schema-Befehl akzeptiert Pflichtparameter" {
  output_file="$BATS_TEST_TMPDIR/schema.json"
  run_cli schema --input file.xlsx --output "$output_file"
  [ "$status" -eq 0 ]
  [ -f "$output_file" ]
}

@test "FA02E: generate-Befehl ohne Argumente zeigt Hilfe" {
  run_cli generate
  [ "$status" -eq 0 ]
  [[ "$output" == *"shift-generator generate"* ]]
}

@test "FA02F: generate-Befehl schlägt bei unvollständigen Pflichtparametern fehl" {
  run_cli generate --schema schema.json --from 2026-04-01
  [ "$status" -eq 1 ]
  [[ "$output" == *"Missing required arguments."* ]]
}

@test "FA02G: generate-Befehl akzeptiert Pflicht- und optionale Parameter" {
  output_file="$BATS_TEST_TMPDIR/shifts.xlsx"
  run_cli generate --schema schema.json --from 2026-04-01 --to 2026-04-02 --output "$output_file" --verbose
  [ "$status" -eq 0 ]
  [ -f "$output_file" ]
}

@test "FA02H: schema-Befehl schlägt bei nicht vorhandenem Input-File fehl" {
  output_file="$BATS_TEST_TMPDIR/schema.json"
  run_cli schema --input test/fixtures/does-not-exist.xlsx --output "$output_file"
  [ "$status" -eq 1 ]
  [[ "$output" == *"ENOENT"* ]]
  [[ "$output" == *"does-not-exist.xlsx"* ]]
}

@test "FA02I: generate-Befehl schlägt bei nicht vorhandener Schema-Datei fehl" {
  output_file="$BATS_TEST_TMPDIR/shifts.xlsx"
  run_cli generate --schema "$BATS_TEST_TMPDIR/does-not-exist.json" --from 2026-04-01 --to 2026-04-02 --output "$output_file"
  [ "$status" -eq 1 ]
  [[ "$output" == *"ENOENT"* ]]
  [[ "$output" == *"does-not-exist.json"* ]]
}

@test "FA02J: generate-Befehl validiert Datumsbereich (Format und Reihenfolge)" {
  output_file="$BATS_TEST_TMPDIR/shifts.xlsx"

  run_cli generate --schema schema.json --from 2026/04/01 --to 2026-04-02 --output "$output_file"
  [ "$status" -eq 1 ]
  [[ "$output" == *"Dates must use YYYY-MM-DD format."* ]]

  run_cli generate --schema schema.json --from 2026-04-03 --to 2026-04-02 --output "$output_file"
  [ "$status" -eq 1 ]
  [[ "$output" == *"'from' must be before or equal to 'to'"* ]]
}