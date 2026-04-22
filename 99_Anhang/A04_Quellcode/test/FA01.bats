# FA01: Das System muss lokal auf dem Rechner ausführbar sein.
load "./helpers.sh"

@test "FA01A: Lokal ausführbar" {
  run_cli --help
  [ "$status" -eq 0 ]
  [[ "$output" == *"Usage:"* ]]
}