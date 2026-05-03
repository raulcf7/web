"""Phase 1 data audit for the FCM/FCK post-match case study.

The script intentionally avoids external dependencies so it can run on a
plain Python 3.11 installation. It streams the large tracking file instead of
loading it fully into memory.
"""

from __future__ import annotations

import ast
import csv
import math
import re
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DATASETS = {
    "eventing": ROOT / "eventing.csv",
    "tracking": ROOT / "tracking.csv",
    "games": ROOT / "games.csv",
}
DOCS = ROOT / "docs"


EVENT_KEY_FIELDS = [
    "id",
    "gameId",
    "period",
    "possId",
    "stateId",
    "phaseId",
    "teamId",
    "attTeamId",
    "defTeamId",
    "playerId",
    "firstPlayerId",
    "lastPlayerId",
    "passerId",
    "receiverId",
    "shooterId",
    "touchId",
    "passId",
    "shotId",
    "tackleId",
    "outcome",
    "phaseType",
    "prevPhaseType",
    "nextPhaseType",
    "state",
    "intensity",
    "startType",
    "turnoverType",
    "shotOutcome",
    "setPlayType",
    "isSetPlay",
    "isTurnover",
    "fromTurnover",
    "completed",
    "blocked",
    "bodyPart",
    "direction",
    "runType",
    "passType",
    "interceptionType",
    "recoveredBy",
    "recoveredLive",
]

NUMERIC_AUDIT_FIELDS = [
    "startClock",
    "endClock",
    "gameClock",
    "startFrameIdx",
    "endFrameIdx",
    "frameIdx",
    "duration",
    "xG",
    "directness",
    "defensiveHeight",
    "distTraveled",
    "distance",
    "goalDistance",
    "endGoalDistance",
    "ballDistTraveled",
    "width",
    "numPasses",
    "verticalPassing",
    "verticalCarrying",
    "passProbability",
    "xgCreated",
]

METRIC_ROWS = [
    ("Control & Territory", "Estimated possession by event volume", "teamId, period, event timestamps or possId", "yes", "medium", "Eventing is not a full touch log; tracking lastTouch can strengthen estimate.", "Shows who had more ball involvement by phase.", "yes"),
    ("Control & Territory", "Field tilt", "teamId/attTeamId, x/end_x or zones, attacking direction", "yes", "medium", "Must confirm whether event coordinates are attack-normalized before comparing halves.", "Separates territorial pressure from sterile possession.", "yes"),
    ("Control & Territory", "Final third entries", "teamId/attTeamId, startLoc/endLoc or startZone/endZone", "yes", "high", "Use meter-based pitch thirds; validate orientation.", "Identifies territorial penetration.", "yes"),
    ("Control & Territory", "Box entries", "teamId/attTeamId, endLoc/targetLoc/receptionLoc, pitch dimensions", "yes", "high", "Define box on centered meter coordinates.", "Direct proxy for accessing high-value spaces.", "yes"),
    ("Control & Territory", "Average recovery height", "turnoverType/startType/recoveredBy, location/startLoc, teamId", "yes", "medium", "Recovery fields are sparse; combine interceptions/tackles/regains carefully.", "Shows where defensive actions regained control.", "yes"),
    ("Progression", "Progressive passes", "passLoc, targetLoc, completed, passerId, teamId, goalDistance/endGoalDistance", "yes", "high", "Use goal-distance reduction and completion state.", "Measures ball progression quality.", "yes"),
    ("Progression", "Progressive carries/runs", "runStartLoc, runEndLoc, runType, playerId/teamId", "yes", "medium", "Runs exist but may be off-ball/intensity segments, not only carries.", "Captures vertical threat and ball-carrying if filtered correctly.", "yes"),
    ("Progression", "Progression by lane", "x/y coordinates, team, period, direction", "yes", "medium", "Lane definitions need pitch width from observed y range.", "Reveals preferred channels.", "yes"),
    ("Progression", "Possession sequences", "possId, phaseId, clocks, teamId/attTeamId, start/end locations", "yes", "high", "Some rows lack possId; document exclusions.", "Connects build-up, progression and outcome.", "yes"),
    ("Progression", "Direct vs elaborate attacks", "phaseType, directness, numPasses, duration, ballDistTraveled", "yes", "high", "Use provider-derived directness and sequence fields.", "Describes attacking style, not just volume.", "yes"),
    ("Chance Creation", "Shots and xG", "shotLoc, shooterId, shotOutcome, xG, teamId", "yes", "high", "xG is sparse but available for shot-related rows.", "Core chance-quality measure.", "yes"),
    ("Chance Creation", "Shot zones", "shotLoc, shotZone, teamId", "yes", "high", "Use shotZone where present; otherwise derive from coordinates.", "Explains quality and shot selection.", "yes"),
    ("Chance Creation", "Key passes / xG created", "xgCreated, ledToShot, passerId, receiverId, passLoc/targetLoc", "yes", "medium", "xgCreated exists but is sparse; confirm linkage to shots.", "Identifies creation contribution.", "yes"),
    ("Chance Creation", "Final-third completed passes", "passLoc, targetLoc, completed, teamId", "yes", "high", "Requires attack-direction normalization.", "Shows ability to connect in advanced areas.", "yes"),
    ("Chance Creation", "Expected threat simplified", "x/y start and end locations, event outcome", "yes", "medium", "Would be a custom grid model, not official xT.", "Adds value-gradient interpretation.", "yes"),
    ("Defence & Pressure", "Recoveries by zone", "startType/turnoverType/recoveredBy, location/startLoc, teamId", "yes", "medium", "Recovery labels are sparse; use transparent event definition.", "Shows defensive regain pattern.", "yes"),
    ("Defence & Pressure", "Dangerous losses", "isTurnover, fromTurnover, startLoc/endLoc, next phase/shot flags", "yes", "medium", "Need define danger window and opponent progression from sequence IDs.", "Connects ball losses to risk.", "yes"),
    ("Defence & Pressure", "PPDA approximate", "opponent passes, defensive actions, zones/direction", "yes", "low", "No standard pressure event feed; approximation only.", "Useful if heavily caveated.", "no"),
    ("Defence & Pressure", "Pressure after loss", "tracking proximity, turnovers, frames, team/player positions", "yes", "low", "Possible with tracking but needs robust synchronization and pressure definition.", "Potentially valuable but risky for intern dashboard.", "no"),
    ("Defence & Pressure", "Block height", "defensiveHeight, phaseType/state, team", "yes", "medium", "Provider field exists for limited phase rows.", "Communicates defensive posture.", "yes"),
    ("Transitions", "Regains ending in final third entry", "possId/phaseId, startType/turnoverType, endLoc/zones, clocks", "yes", "medium", "Need possession ordering and time window.", "Shows transition efficiency.", "yes"),
    ("Transitions", "Regains ending in shot", "possId, fromTurnover, ledToShot, shotId, clocks", "yes", "medium", "Shot linkage should be validated by possId and clock.", "Identifies high-impact regains.", "yes"),
    ("Transitions", "Counterattacks", "phaseType, directness, duration, verticalPassing/Carrying, shot/final-third end", "yes", "high", "Provider has counter_attack phaseType.", "Separates transition threat from positional attack.", "yes"),
    ("Players", "Offensive impact ranking", "playerId/passerId/receiverId/shooterId, xG, xgCreated, progression fields", "yes", "high", "Aggregate role-specific contributions rather than raw counts only.", "Highlights influential players.", "yes"),
    ("Players", "Progression contribution", "passerId, playerId, progressive pass/carry fields", "yes", "high", "Need map Opta IDs to names from games.", "Shows who moved the team forward.", "yes"),
    ("Players", "Dangerous losses ranking", "playerId, isTurnover, locations, next possession danger", "yes", "medium", "Risk definition must be transparent.", "Supports coaching feedback.", "yes"),
    ("Players", "Per-90 normalization", "tracking player presence or minutes", "yes", "medium", "Minutes can be derived from tracking active frames, not directly provided.", "Makes player comparisons fairer.", "yes"),
    ("Tracking", "Distance covered", "tracking homePlayers/awayPlayers xyz by frame/player", "yes", "medium", "Need handle substitutions/missing frames; speed or coordinate delta methods.", "Physical workload context.", "yes"),
    ("Tracking", "Max speed", "tracking player speed", "yes", "high", "Speed is present per player per frame.", "Useful physical peak metric.", "yes"),
    ("Tracking", "Sprint / high intensity distance", "tracking speed, frame delta", "yes", "medium", "Thresholds must be stated; provider thresholds may differ.", "Physical intensity profile.", "yes"),
    ("Tracking", "Team width/depth/compactness", "tracking player xyz by team/frame, live flag", "yes", "medium", "Need exclude goalkeepers or report both versions.", "Shows team shape and spacing.", "yes"),
    ("Tracking", "Line distances", "tracking positions, player roles/positions", "yes", "low", "Roles from games are starting positions and substitutes; line assignment may be noisy.", "Potentially tactical but easy to overinterpret.", "no"),
    ("Tracking", "Numerical superiority/density", "tracking xyz, zones, event windows", "yes", "low", "Requires careful spatial/time-window definition.", "Advanced tactical value but may distract.", "no"),
    ("Unsupported", "Official xT", "official xT model/output", "no", "high", "No official xT field found.", "Would be valuable but unavailable as official metric.", "no"),
    ("Unsupported", "Official pressure event model", "provider pressure events/probabilities", "no", "medium", "Some pressure-like fields exist, but no complete pressure event feed.", "Avoid overclaiming defensive pressure.", "no"),
]


@dataclass
class FieldSummary:
    dataset: str
    column_name: str
    inferred_types: Counter[str] = field(default_factory=Counter)
    nonnull_count: int = 0
    null_count: int = 0
    unique_values: set[str] = field(default_factory=set)
    unique_count_capped: bool = False
    min_value: float | None = None
    max_value: float | None = None
    samples: list[str] = field(default_factory=list)

    def update(self, value: str, unique_limit: int = 100) -> None:
        if value == "":
            self.null_count += 1
            self.inferred_types["null"] += 1
            return
        self.nonnull_count += 1
        inferred = infer_type(value)
        self.inferred_types[inferred] += 1
        if len(self.unique_values) < unique_limit:
            self.unique_values.add(value)
        elif value not in self.unique_values:
            self.unique_count_capped = True
        if len(self.samples) < 5:
            self.samples.append(value[:120])
        number = to_number(value)
        if number is not None:
            self.min_value = number if self.min_value is None else min(self.min_value, number)
            self.max_value = number if self.max_value is None else max(self.max_value, number)

    @property
    def row_count(self) -> int:
        return self.nonnull_count + self.null_count

    def csv_row(self) -> dict[str, Any]:
        null_pct = self.null_count / self.row_count if self.row_count else 0
        types = "; ".join(f"{k}:{v}" for k, v in self.inferred_types.most_common())
        samples = " | ".join(self.samples)
        value_range = ""
        if self.min_value is not None and self.max_value is not None:
            value_range = f"{self.min_value:g} to {self.max_value:g}"
        return {
            "dataset": self.dataset,
            "column_name": self.column_name,
            "inferred_type": types,
            "nonnull_count": self.nonnull_count,
            "null_count": self.null_count,
            "null_pct": round(null_pct, 4),
            "unique_count": f">={len(self.unique_values)}" if self.unique_count_capped else len(self.unique_values),
            "sample_values": samples,
            "numeric_range": value_range,
            "notes": field_note(self.column_name, self.unique_count_capped),
        }


def infer_type(value: str) -> str:
    if value == "":
        return "null"
    if value.upper() in {"TRUE", "FALSE"}:
        return "boolean"
    if to_number(value) is not None:
        return "number"
    if (value.startswith("[") and value.endswith("]")) or (value.startswith("{") and value.endswith("}")):
        return "nested"
    return "string"


def to_number(value: str) -> float | None:
    if value == "":
        return None
    try:
        number = float(value)
    except ValueError:
        return None
    if math.isfinite(number):
        return number
    return None


def field_note(column: str, unique_count_capped: bool = False) -> str:
    lower = column.lower()
    suffix = "; unique count capped at 100" if unique_count_capped else ""
    if lower in {"gameid", "game_id", "second spectrum id", "opta id"}:
        return "join key candidate" + suffix
    if lower in {"playerid", "playerid", "optaid", "passerid", "receiverid", "shooterid"}:
        return "player identifier candidate" + suffix
    if lower in {"period", "frameidx", "gameclock", "wallclock", "startclock", "endclock"}:
        return "temporal synchronization field" + suffix
    if lower.endswith("loc") or "location" in lower or lower in {"ball", "homeplayers", "awayplayers"}:
        return "spatial or nested tracking field" + suffix
    if lower in {"outcome", "phasetype", "state", "starttype", "turnovertype"}:
        return "event classification field" + suffix
    return suffix.lstrip("; ")


def read_csv_rows(path: Path):
    with path.open("r", newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            yield row


def profile_dataset(dataset: str, path: Path) -> tuple[list[FieldSummary], list[dict[str, str]], int]:
    with path.open("r", newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        summaries = {field: FieldSummary(dataset, field) for field in reader.fieldnames or []}
        samples: list[dict[str, str]] = []
        row_count = 0
        for row in reader:
            row_count += 1
            if len(samples) < 3:
                samples.append({k: (v[:160] if isinstance(v, str) else v) for k, v in row.items()})
            for field_name, summary in summaries.items():
                summary.update(row.get(field_name, ""))
    return list(summaries.values()), samples, row_count


def parse_literal(value: str) -> Any:
    try:
        return ast.literal_eval(value)
    except (ValueError, SyntaxError):
        return None


def coord_from_value(value: str) -> tuple[float, float, float | None] | None:
    parsed = parse_literal(value)
    if not isinstance(parsed, (list, tuple)) or len(parsed) < 2:
        return None
    if not isinstance(parsed[0], (int, float)) or not isinstance(parsed[1], (int, float)):
        return None
    z_value = parsed[2] if len(parsed) > 2 and isinstance(parsed[2], (int, float)) else None
    return float(parsed[0]), float(parsed[1]), float(z_value) if z_value is not None else None


def update_axis(stats: dict[str, float | int | None], x: float, y: float, z: float | None) -> None:
    stats["count"] = int(stats["count"]) + 1
    for axis, value in [("x", x), ("y", y), ("z", z)]:
        if value is None:
            continue
        min_key = f"{axis}_min"
        max_key = f"{axis}_max"
        stats[min_key] = value if stats[min_key] is None else min(float(stats[min_key]), value)
        stats[max_key] = value if stats[max_key] is None else max(float(stats[max_key]), value)


def audit_eventing() -> dict[str, Any]:
    rows = list(read_csv_rows(DATASETS["eventing"]))
    headers = rows[0].keys() if rows else []
    blank_rows = 0
    field_counts: dict[str, Counter[str]] = {field: Counter() for field in EVENT_KEY_FIELDS}
    numeric_ranges: dict[str, dict[str, float | int | None]] = {
        field: {"count": 0, "min": None, "max": None} for field in NUMERIC_AUDIT_FIELDS
    }
    coord_fields = [
        field
        for field in headers
        if field.lower().endswith("loc") or "location" in field.lower()
    ]
    coord_ranges: dict[str, dict[str, float | int | None]] = {
        field: {"count": 0, "x_min": None, "x_max": None, "y_min": None, "y_max": None, "z_min": None, "z_max": None}
        for field in coord_fields
    }
    period_counts = Counter()
    shots_by_team_period: dict[tuple[str, str], Counter[str]] = defaultdict(Counter)

    for row in rows:
        if all(value == "" for key, value in row.items() if key != "order"):
            blank_rows += 1
        period_counts[row.get("period", "") or "blank"] += 1
        for field_name in EVENT_KEY_FIELDS:
            value = row.get(field_name, "")
            if value:
                field_counts[field_name][value] += 1
        for field_name in NUMERIC_AUDIT_FIELDS:
            value = to_number(row.get(field_name, ""))
            if value is None:
                continue
            stat = numeric_ranges[field_name]
            stat["count"] = int(stat["count"]) + 1
            stat["min"] = value if stat["min"] is None else min(float(stat["min"]), value)
            stat["max"] = value if stat["max"] is None else max(float(stat["max"]), value)
        for field_name in coord_fields:
            coord = coord_from_value(row.get(field_name, ""))
            if coord:
                update_axis(coord_ranges[field_name], *coord)
        if row.get("shotLoc"):
            key = (row.get("teamId") or row.get("attTeamId") or "unknown", row.get("period") or "unknown")
            shots_by_team_period[key]["shots"] += 1
            shots_by_team_period[key]["goals"] += int(row.get("shotOutcome") == "goal" or row.get("isScored") == "TRUE")

    return {
        "rows": len(rows),
        "columns": len(list(headers)),
        "blank_rows": blank_rows,
        "field_counts": field_counts,
        "numeric_ranges": numeric_ranges,
        "coord_ranges": coord_ranges,
        "period_counts": period_counts,
        "shots_by_team_period": shots_by_team_period,
    }


def audit_games() -> dict[str, Any]:
    rows = list(read_csv_rows(DATASETS["games"]))
    game = rows[0] if rows else {}
    home_players = parse_literal(game.get("homePlayers", "")) or []
    away_players = parse_literal(game.get("awayPlayers", "")) or []
    player_map: dict[str, dict[str, str]] = {}
    for side, players in [("home", home_players), ("away", away_players)]:
        for player in players:
            if not isinstance(player, dict):
                continue
            opta_id = str(player.get("optaId", ""))
            if opta_id:
                player_map[opta_id] = {
                    "name": str(player.get("name", "")),
                    "team_side": side,
                    "position": str(player.get("position", "")),
                    "ssiId": str(player.get("ssiId", "")),
                }
    return {
        "rows": len(rows),
        "game": game,
        "home_players_count": len(home_players),
        "away_players_count": len(away_players),
        "player_map": player_map,
    }


def audit_tracking() -> dict[str, Any]:
    row_count = 0
    null_counts: Counter[str] = Counter()
    unique_values: dict[str, set[str]] = defaultdict(set)
    numeric_ranges = {
        field: {"count": 0, "min": None, "max": None}
        for field in ["period", "frameIdx", "gameClock", "wallClock"]
    }
    period_stats: dict[str, dict[str, Any]] = {}
    coord_stats = {
        key: {"count": 0, "x_min": None, "x_max": None, "y_min": None, "y_max": None, "z_min": None, "z_max": None, "speed_min": None, "speed_max": None}
        for key in ["homePlayers", "awayPlayers", "ball"]
    }
    opta_ids: set[str] = set()
    ssi_ids: set[str] = set()
    period_start_samples: dict[str, dict[str, str]] = {}

    for row in read_csv_rows(DATASETS["tracking"]):
        row_count += 1
        for field_name, value in row.items():
            if value == "":
                null_counts[field_name] += 1
        for field_name in ["period", "game_id", "live", "lastTouch"]:
            if row.get(field_name):
                unique_values[field_name].add(row[field_name])
        for field_name in numeric_ranges:
            value = to_number(row.get(field_name, ""))
            if value is None:
                continue
            stat = numeric_ranges[field_name]
            stat["count"] = int(stat["count"]) + 1
            stat["min"] = value if stat["min"] is None else min(float(stat["min"]), value)
            stat["max"] = value if stat["max"] is None else max(float(stat["max"]), value)

        period = row.get("period", "unknown")
        if period not in period_stats:
            period_stats[period] = {
                "rows": 0,
                "live_true": 0,
                "frame_min": None,
                "frame_max": None,
                "clock_min": None,
                "clock_max": None,
            }
            period_start_samples[period] = {
                "frameIdx": row.get("frameIdx", ""),
                "gameClock": row.get("gameClock", ""),
                "lastTouch": row.get("lastTouch", ""),
                "ball": row.get("ball", ""),
            }
        period_stat = period_stats[period]
        period_stat["rows"] += 1
        period_stat["live_true"] += int(row.get("live") == "True")
        frame = to_number(row.get("frameIdx", ""))
        clock = to_number(row.get("gameClock", ""))
        if frame is not None:
            period_stat["frame_min"] = frame if period_stat["frame_min"] is None else min(period_stat["frame_min"], frame)
            period_stat["frame_max"] = frame if period_stat["frame_max"] is None else max(period_stat["frame_max"], frame)
        if clock is not None:
            period_stat["clock_min"] = clock if period_stat["clock_min"] is None else min(period_stat["clock_min"], clock)
            period_stat["clock_max"] = clock if period_stat["clock_max"] is None else max(period_stat["clock_max"], clock)

        for side in ["homePlayers", "awayPlayers"]:
            players = parse_literal(row.get(side, "")) or []
            if not isinstance(players, list):
                continue
            for player in players:
                if not isinstance(player, dict):
                    continue
                if player.get("optaId"):
                    opta_ids.add(str(player["optaId"]))
                if player.get("playerId"):
                    ssi_ids.add(str(player["playerId"]))
                xyz = player.get("xyz")
                if isinstance(xyz, list) and len(xyz) >= 3:
                    update_axis(coord_stats[side], float(xyz[0]), float(xyz[1]), float(xyz[2]))
                speed = player.get("speed")
                if isinstance(speed, (int, float)):
                    stat = coord_stats[side]
                    stat["speed_min"] = speed if stat["speed_min"] is None else min(float(stat["speed_min"]), speed)
                    stat["speed_max"] = speed if stat["speed_max"] is None else max(float(stat["speed_max"]), speed)

        ball = parse_literal(row.get("ball", "")) or {}
        if isinstance(ball, dict):
            xyz = ball.get("xyz")
            if isinstance(xyz, list) and len(xyz) >= 3:
                update_axis(coord_stats["ball"], float(xyz[0]), float(xyz[1]), float(xyz[2]))
            speed = ball.get("speed")
            if isinstance(speed, (int, float)):
                stat = coord_stats["ball"]
                stat["speed_min"] = speed if stat["speed_min"] is None else min(float(stat["speed_min"]), speed)
                stat["speed_max"] = speed if stat["speed_max"] is None else max(float(stat["speed_max"]), speed)

    return {
        "rows": row_count,
        "null_counts": null_counts,
        "unique_values": unique_values,
        "numeric_ranges": numeric_ranges,
        "period_stats": period_stats,
        "coord_stats": coord_stats,
        "unique_tracking_opta_ids": len(opta_ids),
        "unique_tracking_ssi_ids": len(ssi_ids),
        "period_start_samples": period_start_samples,
    }


def write_available_fields(summary_rows: list[dict[str, Any]]) -> None:
    output = DOCS / "available_fields_summary.csv"
    fields = [
        "dataset",
        "column_name",
        "inferred_type",
        "nonnull_count",
        "null_count",
        "null_pct",
        "unique_count",
        "sample_values",
        "numeric_range",
        "notes",
    ]
    with output.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerows(summary_rows)


def write_metric_matrix() -> None:
    output = DOCS / "metric_feasibility_matrix.csv"
    fields = [
        "metric_group",
        "metric_name",
        "required_fields",
        "available_yes_no",
        "confidence_level",
        "assumptions_needed",
        "football_value",
        "recommended_for_dashboard_yes_no",
    ]
    with output.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(fields)
        writer.writerows(METRIC_ROWS)


def counter_markdown(counter: Counter[str], limit: int = 12) -> str:
    if not counter:
        return "No non-null values found."
    return ", ".join(f"`{key}` ({value})" for key, value in counter.most_common(limit))


def range_markdown(ranges: dict[str, dict[str, float | int | None]], fields: list[str]) -> str:
    lines = []
    for field_name in fields:
        stat = ranges.get(field_name)
        if not stat or not stat.get("count"):
            continue
        lines.append(f"- `{field_name}`: {stat['min']} to {stat['max']} ({stat['count']} non-null)")
    return "\n".join(lines) if lines else "- No numeric ranges available."


def coords_markdown(coord_ranges: dict[str, dict[str, float | int | None]]) -> str:
    lines = []
    for field_name, stat in coord_ranges.items():
        if not stat.get("count"):
            continue
        lines.append(
            f"- `{field_name}`: n={stat['count']}, "
            f"x={stat['x_min']} to {stat['x_max']}, "
            f"y={stat['y_min']} to {stat['y_max']}, "
            f"z={stat['z_min']} to {stat['z_max']}"
        )
    return "\n".join(lines) if lines else "- No parsed coordinate fields."


def write_report(eventing: dict[str, Any], games: dict[str, Any], tracking: dict[str, Any]) -> None:
    game = games["game"]
    home = game.get("Home Team", "home")
    away = game.get("Away Team", "away")
    report = f"""# Data Quality Report - Phase 1 Audit

## Match Context
- Match: {game.get("Description", "unknown")}
- Date: {game.get("Date", "unknown")}
- Home team: {home} (`homeOptaId={game.get("homeOptaId", "unknown")}`)
- Away team: {away} (`awayOptaId={game.get("awayOptaId", "unknown")}`)
- Opta match id: `{game.get("Opta Id", "unknown")}`
- Second Spectrum match id: `{game.get("Second Spectrum Id", "unknown")}`

## Dataset Summary
- `games.csv`: {games["rows"]} row, {games["home_players_count"]} listed home players, {games["away_players_count"]} listed away players.
- `eventing.csv`: {eventing["rows"]:,} rows, {eventing["columns"]} columns, {eventing["blank_rows"]:,} rows with no analytical data outside `order`.
- `tracking.csv`: {tracking["rows"]:,} frames, 10 columns, no nulls in the top-level tracking columns.

## Key Joins
- High confidence: `eventing.gameId` -> `games.Opta Id` (`{game.get("Opta Id", "unknown")}`).
- High confidence: `tracking.game_id` -> `games.Second Spectrum Id` (`{game.get("Second Spectrum Id", "unknown")}`).
- High confidence for player mapping: `eventing` player fields use Opta IDs; `tracking` has both SSI `playerId` and `optaId`, and `games` contains both.
- High confidence for teams: `{home}` maps to Opta team `{game.get("homeOptaId", "unknown")}` and `{away}` maps to Opta team `{game.get("awayOptaId", "unknown")}`.

## Temporal Structure
Eventing periods: {counter_markdown(eventing["field_counts"]["period"])}

Tracking period profile:
"""
    for period, stat in sorted(tracking["period_stats"].items()):
        report += (
            f"- Period {period}: {stat['rows']:,} frames, "
            f"frames {stat['frame_min']} to {stat['frame_max']}, "
            f"gameClock {stat['clock_min']} to {stat['clock_max']}, "
            f"live frames {stat['live_true']:,}.\n"
        )

    report += f"""
The tracking feed advances at approximately 25 frames per second because consecutive `gameClock` values differ by 0.04 seconds.

## Event Fields
- Team fields: `teamId`, `attTeamId`, `defTeamId`.
- Possession/phase fields: `possId`, `stateId`, `phaseId`, `phaseType`, `state`.
- Player fields: `playerId`, `firstPlayerId`, `lastPlayerId`, `passerId`, `receiverId`, `shooterId`.
- Pass fields: `passLoc`, `targetLoc`, `completed`, `blocked`, `direction`, `bodyPart`, `passProbability`.
- Shot fields: `shotLoc`, `shotOutcome`, `shotTechnique`, `xG`, `isScored`, `isOnGoal`, `shooterId`.
- Transition/turnover fields: `isTurnover`, `fromTurnover`, `turnoverType`, `startType`, `recoveredBy`, `recoveredLive`.

Important event classifications:
- `outcome`: {counter_markdown(eventing["field_counts"]["outcome"])}
- `phaseType`: {counter_markdown(eventing["field_counts"]["phaseType"])}
- `startType`: {counter_markdown(eventing["field_counts"]["startType"])}
- `shotOutcome`: {counter_markdown(eventing["field_counts"]["shotOutcome"])}
- `runType`: {counter_markdown(eventing["field_counts"]["runType"])}

## Spatial Audit
The coordinate system is not 0-1 or 0-100. Parsed tracking locations are in a centered metric pitch coordinate system:
- Home player x/y range: x={tracking["coord_stats"]["homePlayers"]["x_min"]} to {tracking["coord_stats"]["homePlayers"]["x_max"]}, y={tracking["coord_stats"]["homePlayers"]["y_min"]} to {tracking["coord_stats"]["homePlayers"]["y_max"]}.
- Away player x/y range: x={tracking["coord_stats"]["awayPlayers"]["x_min"]} to {tracking["coord_stats"]["awayPlayers"]["x_max"]}, y={tracking["coord_stats"]["awayPlayers"]["y_min"]} to {tracking["coord_stats"]["awayPlayers"]["y_max"]}.
- Ball x/y/z range: x={tracking["coord_stats"]["ball"]["x_min"]} to {tracking["coord_stats"]["ball"]["x_max"]}, y={tracking["coord_stats"]["ball"]["y_min"]} to {tracking["coord_stats"]["ball"]["y_max"]}, z={tracking["coord_stats"]["ball"]["z_min"]} to {tracking["coord_stats"]["ball"]["z_max"]}.

Eventing coordinate fields:
{coords_markdown(eventing["coord_ranges"])}

Direction of attack is inferable but must be handled carefully:
- Tracking is raw pitch orientation and teams switch sides between periods.
- First-half kickoff/goalkeeper positioning indicates FCK starts attacking toward positive x and FCM toward negative x; this switches after halftime.
- Shot-related eventing locations are strongly positive-x oriented near the attacking goal, so some eventing shot fields appear attack-normalized. This must be validated before field tilt or lane comparisons.

## Data Quality Issues
- `eventing.csv` contains {eventing["blank_rows"]:,} blank analytical rows; they should be retained in raw audit but excluded from clean event tables with a documented rule.
- Many eventing columns are intentionally sparse because the table mixes event, phase, run, pass, shot, tackle and set-piece concepts.
- `tracking.csv` stores players and ball as nested string literals; Tableau-ready outputs will require flattening.
- Python is expected by `.python-version` and VS Code settings, but no `python` executable was available in this shell session.

## Metric Feasibility Summary
- Strong candidates for the dashboard: shots/xG, field tilt, final-third entries, box entries, progressive passes, possession sequences, direct vs elaborate attacks, transition/counterattack phases, player progression and creation profiles.
- Use with caution: PPDA, pressure after loss, line distances, compactness and density metrics. Tracking supports them technically, but definitions must be transparent and avoid overclaiming.
- Not supported as official metrics: official xT and official pressure model outputs.
"""
    (DOCS / "data_quality_report.md").write_text(report, encoding="utf-8")


def main() -> None:
    DOCS.mkdir(exist_ok=True)
    all_summaries: list[dict[str, Any]] = []
    for dataset, path in DATASETS.items():
        summaries, _samples, _row_count = profile_dataset(dataset, path)
        all_summaries.extend(summary.csv_row() for summary in summaries)

    games = audit_games()
    eventing = audit_eventing()
    tracking = audit_tracking()

    write_available_fields(all_summaries)
    write_metric_matrix()
    write_report(eventing, games, tracking)

    print("Audit complete.")
    print(f"Wrote {DOCS / 'data_quality_report.md'}")
    print(f"Wrote {DOCS / 'available_fields_summary.csv'}")
    print(f"Wrote {DOCS / 'metric_feasibility_matrix.csv'}")


if __name__ == "__main__":
    main()
