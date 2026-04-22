# FA03: Das Tool muss Planungsdaten aus einem definierten Input (von Teams exportierten Excel) verarbeiten und in die interne Ressourcenlogik übernehmen.
load "./helpers.sh"

create_fa03_teams_export() {
  local output_file="$1"

  node -e "
    const xlsx = require('xlsx');
    const workbook = xlsx.utils.book_new();

    const shifts = xlsx.utils.json_to_sheet([
      {
        'Member': 'Alice',
        'Work Email': 'alice@example.com',
        'Group': 'Support',
        'Start Date': '2026-04-07',
        'Start Time': '08:00',
        'End Date': '2026-04-07',
        'End Time': '16:00',
        'Theme Color': '1. White',
        'Custom Label': null,
        'Unpaid Break (minutes)': null,
        'Notes': 'Morning',
        'Shared': '1. Shared'
      },
      {
        'Member': 'Alice',
        'Work Email': 'alice@example.com',
        'Group': 'Support',
        'Start Date': '2026-04-08',
        'Start Time': '08:00',
        'End Date': '2026-04-08',
        'End Time': '16:00',
        'Theme Color': '1. White',
        'Custom Label': null,
        'Unpaid Break (minutes)': null,
        'Notes': 'Morning',
        'Shared': '1. Shared'
      }
    ]);

    const timeOff = xlsx.utils.json_to_sheet([
      {
        'Member': 'Alice',
        'Work Email': 'alice@example.com',
        'Start Date': '2026-04-09',
        'Start Time': '00:00',
        'End Date': '2026-04-10',
        'End Time': '23:59',
        'Time Off Reason': 'Vacation',
        'Theme Color': '1. White',
        'Notes': null,
        'Shared': '1. Shared'
      }
    ]);

    xlsx.utils.book_append_sheet(workbook, shifts, 'Shifts');
    xlsx.utils.book_append_sheet(workbook, timeOff, 'Time Off');
    xlsx.writeFile(workbook, process.argv[1]);
  " "$output_file"
}

@test "FA03A: Teams-Export kann in internes Schema umgewandelt werden" {
  input_file="$BATS_TEST_TMPDIR/fa03-teams-export.xlsx"
  output_file="$BATS_TEST_TMPDIR/fa03-schema.json"
  create_fa03_teams_export "$input_file"

  run_cli schema --input "$input_file" --output "$output_file"

  [ "$status" -eq 0 ]
  [ -f "$output_file" ]
  [[ "$output" == *"Generated"* ]]
}

@test "FA03B: Ressourcenlogik enthält erwartete Gruppen, User, Schichten und Abwesenheiten" {
  input_file="$BATS_TEST_TMPDIR/fa03-teams-export.xlsx"
  output_file="$BATS_TEST_TMPDIR/fa03-schema.json"
  create_fa03_teams_export "$input_file"

  run_cli schema --input "$input_file" --output "$output_file"
  [ "$status" -eq 0 ]

  run node -e "
    const fs = require('node:fs');
    const schema = JSON.parse(fs.readFileSync(process.argv[1], 'utf8'));
    const group = schema.groups.Support;
    if (!group) {
      throw new Error('Expected group Support');
    }

    if (!Array.isArray(group.users) || group.users.length !== 1) {
      throw new Error('Expected exactly one user in group Support');
    }
    const user = group.users[0];
    if (user.member !== 'Alice' || user.workEmail !== 'alice@example.com') {
      throw new Error('Unexpected user identity');
    }

    const absence = user.absences?.[0];
    if (!absence || absence.reason !== 'Vacation') {
      throw new Error('Expected Vacation absence');
    }
    if (absence.date.from !== '2026-04-09' || absence.date.to !== '2026-04-10') {
      throw new Error('Unexpected absence date range');
    }

    if (!Array.isArray(user.possibleShifts) || user.possibleShifts[0] !== 'Morning') {
      throw new Error('Expected Morning possible shift');
    }

    if (!Array.isArray(group.shiftTypes) || group.shiftTypes.length !== 1) {
      throw new Error('Expected exactly one shift type');
    }
    const shiftType = group.shiftTypes[0];
    if (shiftType.name !== 'Morning' || shiftType.start !== '08:00' || shiftType.end !== '16:00') {
      throw new Error('Unexpected shift type definition');
    }
    if (JSON.stringify(shiftType.activeDays) !== JSON.stringify([2, 3])) {
      throw new Error('Unexpected active days');
    }
  " "$output_file"

  [ "$status" -eq 0 ]
}

@test "FA03C: Teams-Import schlägt bei ungültigem Input-Pfad mit klarer Fehlermeldung fehl" {
  output_file="$BATS_TEST_TMPDIR/fa03-schema.json"

  run_cli schema --input test/fixtures/does-not-exist.xlsx --output "$output_file"

  [ "$status" -eq 1 ]
  [[ "$output" == *"ENOENT"* ]]
  [[ "$output" == *"does-not-exist.xlsx"* ]]
}
