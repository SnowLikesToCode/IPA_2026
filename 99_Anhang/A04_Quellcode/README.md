# Shift planner (Teams Excel ↔ schema JSON)

Node.js CLI that (1) builds a planner-focused `schema.json` from a Microsoft Teams shifts export workbook and (2) generates a new Teams-style `.xlsx` for a given date range from that schema.

## Install

```bash
pnpm install
```

The package exposes the CLI as `shift-generator` / `shiftplanner` (see `package.json` `bin`) and as `node src/cli.js`.

## CLI overview

```text
shift-generator schema --input teams-export.xlsx --output schema.json
shift-generator generate --schema schema.json --from YYYY-MM-DD --to YYYY-MM-DD [--output shifts.xlsx] [--verbose] [--trace]
```

- `generate` and `export` are the same command (`export` is an alias).
- `schema`: requires `--input` and `--output`, or two positional arguments in that order.
- `generate`: requires `--schema`, `--from`, and `--to` (all dates `YYYY-MM-DD`, `from` ≤ `to`).
- If `--output` is omitted for `generate`, the file name is `generated-shifts-YYYYMMDD-HHMMSS.xlsx` in the current working directory (`createTimestampedFileName` in `src/utils/date.js`).
- `--verbose`: logs phase timings (read schema, generation, workbook write).
- `--trace`: implies `--verbose` and prints a breakdown of eligibility-failure reasons (from internal counters during candidate filtering).

Examples:

```bash
pnpm run cli -- schema --input ./file.xlsx --output ./schema.json
pnpm run cli -- generate --schema ./schema.json --from 2026-04-01 --to 2026-04-30 --output ./generated-shifts.xlsx
pnpm run cli -- export --schema ./schema.json --from 2026-04-01 --to 2026-04-30 --trace
```

```bash
node src/cli.js schema --input ./file.xlsx --output ./schema.json
node src/cli.js generate --schema ./schema.json --from 2026-04-01 --to 2026-04-30
```

## 1) Schema from Excel (`schema` command)

**Input:** a workbook readable by `xlsx.readFile` (`src/parsers/excel-export.parser.js`).

**Sheets read:** only `Shifts` and `Time Off`. Other sheets are ignored.

**Shifts rows** must have non-empty `Member`, `Work Email`, and `Group`. Dates/times are normalized from Excel serials, `MM/DD/YYYY`, `YYYY-MM-DD`, or `Date` values; times support Excel fractions and `H:MM` / `HH:MM`.

**Per shift type (within each group):** rows are grouped by a composite key `name + startTime + endTime`. The display **name** is: `Notes` if present, else `Custom Label`, else `` `${startTime}-${endTime}` `` (defaults `00:00` if missing). **activeDays** collects ISO weekdays (`1` = Monday … `7` = Sunday) from each row’s `Start Date`. If none were collected, serialization uses `[1, 2, 3, 4, 5]`.

**Defaults on extracted shift types:** `themeColor` `"1. White"` if missing, `canBeDoubleBooked` `false`, `needed` `true`, `avoidAfter` / `avoidDuring` empty arrays.

**Users:** one entry per `member` + `workEmail`; **possibleShifts** is the set of shift names that user actually appeared on in `Shifts`. **absences** come from `Time Off` rows (date range from `Start Date` / `End Date`, reason from `Time Off Reason` or `"Unknown"`).

**Output:** JSON with top-level `{ "groups": { "<groupName>": { "users": [...], "shiftTypes": [...] } } }`, groups/users/shift types sorted for stable output.

## 2) Workbook from schema (`generate` / `export` command)

**Validation:** `schema.groups` must exist (`src/core/validator.js`). Date range must be valid ISO dates.

**Generation** (`src/core/planner.js`, `src/core/rules-engine.js`):

- Iterates every calendar day from `from` to `to`, then each group (object key order), then each **active** shift type for that weekday. A shift type is active if `activeDays` is non-empty and includes the day’s ISO weekday; if `activeDays` is missing or empty, `[1, 2, 3, 4, 5]` is used.
- **One assignment** per group per date per shift type (one row in `Shifts` if filled).
- **Order of shift types:** all with `needed !== false` first, then those with `needed === false` (optional). Optional slots are only filled if an eligible user exists; **they are not written to `Open Shifts` when skipped** (only required shifts can create open-shift rows when unassigned).

**Eligibility** (all must pass):

- User’s `possibleShifts` includes this shift type’s `name`.
- User is not absent on that date (`absences` ranges from schema).
- **avoidDuring (same day):** conflict if the new shift’s `avoidDuring` contains an already-assigned shift name for that user that day, or an already-assigned shift’s `avoidDuring` contains the incoming shift name (`hasDuringConflict` — symmetric by shift name).
- **Double booking:** if the user already has shifts that day, a new non–double-booked shift is allowed only if every existing shift that day has `canBeDoubleBooked === true`, or the incoming shift has `canBeDoubleBooked === true` (`canAssignWithExistingShifts`).
- **avoidAfter:** if `avoidAfter` lists shift names, any prior assignment in the **lookback window** blocks the user. The window length equals the **rotation window** (see below). History only counts dates **strictly before** the current date within that window (`hasBlockedHistory`).
- **Rotation:** per group and shift type (key: group + name + start + end). **Rotation window** = `max(1, activeDays.length)` when `activeDays` is non-empty; otherwise **5**. While a streak is active, only that user may be chosen (`rotation-continuity-enforced`). New streaks start with the **least-assigned** eligible user (`pickLeastAssigned`: lowest global assignment count, then `member`, then `workEmail`). After **rotationWindow** consecutive days on that shift for that user, a **cooldown** of `rotationWindow + 1` steps is stored for that user on that shift’s rotation state; `decrementCooldowns` runs once per shift-type iteration (users remain ineligible with `rotation-cooldown` until the counter reaches zero).

If no user is eligible and the shift is **required** (`needed !== false`), one row is added to **Open Shifts** with a fixed reason string (`buildOpenShift`).

**Time off in the output workbook:** built from each user’s `absences` clipped to `[from, to]` (`collectTimeOffInRange`).

**Writing** (`src/parsers/excel-import.parser.js`): workbook built with `xlsx`, sheets in this order:

1. `Shifts` — assigned shifts (Notes column uses the shift type name when the default notes field is null; other columns use `TEAMS_DEFAULTS` where applicable).
2. `Time Off` — clipped absences; start/end times from defaults (`00:00` / `23:59`).
3. `Open Shifts` — unassigned required slots; `Open Slots` and other fields from defaults.
4. `Day Notes` — header only (no rows; `TEAMS_DEFAULTS.dayNotes` is empty).
5. `Members` — deduplicated users from the schema (`member` / `work email`).

Teams-specific literals (theme colors, shared flags, empty custom labels, etc.) are **not** stored in `schema.json`; they are applied when writing the workbook.

## Schema shape (minimal)

```json
{
  "groups": {}
}
```

`groups` is required. Each group typically contains `users` and `shiftTypes` as produced by the `schema` command; you can edit JSON to tune `themeColor`, `activeDays` (ISO weekdays 1–7), `needed`, `canBeDoubleBooked`, `avoidAfter`, and `avoidDuring`.

## Other scripts

- **`pnpm run build`:** runs `pkg` to produce binaries under `dist/` (targets in `package.json` `pkg.targets`).
- **`pnpm test`:** runs Bats tests as defined in `package.json` (expects `test/bats` and `test/FA0*.bats` in the environment).
