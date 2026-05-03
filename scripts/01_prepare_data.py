"""Prepare clean football datasets for analysis and Tableau.

Phase 2 takes the audited raw files and produces tidy, analysis-ready CSVs:

- outputs/clean_events.csv
- outputs/clean_tracking.csv
- outputs/clean_games.csv
- outputs/player_lookup.csv
- docs/preparation_assumptions.md

The script uses only the Python standard library and streams the large tracking
file so it can run on a plain Python 3.11 installation.
"""

from __future__ import annotations

import ast
import csv
import json
import math
import re
from pathlib import Path
from typing import Any, Iterable


ROOT = Path(__file__).resolve().parents[1]
INPUTS = {
    "events": ROOT / "eventing.csv",
    "tracking": ROOT / "tracking.csv",
    "games": ROOT / "games.csv",
}
OUTPUTS = ROOT / "outputs"
DOCS = ROOT / "docs"

PITCH_LENGTH = 112.0
PITCH_WIDTH = 80.0
THIRD_X = PITCH_LENGTH / 6.0
BOX_X_MIN = PITCH_LENGTH / 2.0 - 16.5
BOX_HALF_WIDTH = 20.16
CHANNEL_Y = PITCH_WIDTH / 6.0


def snake_case(name: str) -> str:
    """Convert mixed provider column names to stable snake_case."""
    value = re.sub(r"[^0-9A-Za-z]+", "_", name.strip())
    value = re.sub(r"([a-z0-9])([A-Z])", r"\1_\2", value)
    value = re.sub(r"([A-Z]+)([A-Z][a-z])", r"\1_\2", value)
    value = re.sub(r"_+", "_", value).strip("_").lower()
    return value or "unnamed"


def read_csv(path: Path) -> Iterable[dict[str, str]]:
    with path.open("r", newline="", encoding="utf-8-sig") as handle:
        yield from csv.DictReader(handle)


def safe_literal(value: str) -> Any:
    if value == "":
        return None
    try:
        return ast.literal_eval(value)
    except (SyntaxError, ValueError):
        return None


def to_float(value: Any) -> float | None:
    if value in (None, ""):
        return None
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    if math.isfinite(number):
        return number
    return None


def to_int_string(value: Any) -> str:
    number = to_float(value)
    if number is None:
        return ""
    return str(int(number))


def parse_coord(value: str) -> tuple[float | None, float | None, float | None]:
    parsed = safe_literal(value)
    if not isinstance(parsed, (list, tuple)) or len(parsed) < 2:
        return None, None, None
    x = to_float(parsed[0])
    y = to_float(parsed[1])
    z = to_float(parsed[2]) if len(parsed) > 2 else None
    return x, y, z


def bool_text(value: Any) -> str:
    if isinstance(value, bool):
        return "true" if value else "false"
    text = str(value).strip().lower()
    if text in {"true", "1", "yes"}:
        return "true"
    if text in {"false", "0", "no"}:
        return "false"
    return ""


def load_game_context() -> dict[str, Any]:
    rows = list(read_csv(INPUTS["games"]))
    if not rows:
        raise RuntimeError("games.csv is empty")
    game = rows[0]
    home_players = safe_literal(game.get("homePlayers", "")) or []
    away_players = safe_literal(game.get("awayPlayers", "")) or []
    player_lookup: dict[str, dict[str, str]] = {}
    for side, team_id, team_name, players in [
        ("home", game.get("homeOptaId", ""), game.get("Home Team", ""), home_players),
        ("away", game.get("awayOptaId", ""), game.get("Away Team", ""), away_players),
    ]:
        if not isinstance(players, list):
            continue
        for player in players:
            if not isinstance(player, dict):
                continue
            opta_id = str(player.get("optaId", ""))
            ssi_id = str(player.get("ssiId", ""))
            item = {
                "match_id": game.get("Second Spectrum Id", ""),
                "game_id_opta": game.get("Opta Id", ""),
                "team_side": side,
                "team_id": str(team_id),
                "team_name": team_name,
                "player_id_opta": opta_id,
                "player_id_ssi": ssi_id,
                "player_name": str(player.get("name", "")),
                "shirt_number": str(player.get("number", "")),
                "position": str(player.get("position", "")),
                "opta_uuid": str(player.get("optaUuid", "")),
            }
            if opta_id:
                player_lookup[opta_id] = item
            if ssi_id:
                player_lookup[ssi_id] = item
    return {
        "raw": game,
        "match_id": game.get("Second Spectrum Id", ""),
        "game_id_opta": game.get("Opta Id", ""),
        "description": game.get("Description", ""),
        "date": game.get("Date", ""),
        "home_team_name": game.get("Home Team", ""),
        "away_team_name": game.get("Away Team", ""),
        "home_team_id": str(game.get("homeOptaId", "")),
        "away_team_id": str(game.get("awayOptaId", "")),
        "home_team_ssi_id": str(game.get("homeSsiId", "")),
        "away_team_ssi_id": str(game.get("awaySsiId", "")),
        "home_players": home_players,
        "away_players": away_players,
        "player_lookup": player_lookup,
    }


def period_offset(period: int | None) -> float:
    if period is None or period <= 1:
        return 0.0
    # Period 1 lasted 2762.20s in the tracking audit. Use a stable match-clock
    # offset so second-half rows sort naturally after first-half rows.
    return 2762.20


def temporal_fields(period_value: Any, clock_candidates: list[Any]) -> dict[str, str]:
    period_num = to_float(period_value)
    period = int(period_num) if period_num is not None else None
    period_second = next((to_float(value) for value in clock_candidates if to_float(value) is not None), None)
    match_second = None
    if period_second is not None:
        match_second = period_second + period_offset(period)
    minute = int(match_second // 60) + 1 if match_second is not None else None
    return {
        "period": str(period) if period is not None else "",
        "period_second": f"{period_second:.2f}" if period_second is not None else "",
        "match_second": f"{match_second:.2f}" if match_second is not None else "",
        "match_minute": str(minute) if minute is not None else "",
        "minute_bin_5": str(((minute - 1) // 5) * 5) if minute is not None else "",
        "minute_bin_10": str(((minute - 1) // 10) * 10) if minute is not None else "",
    }


def team_meta(team_id: str, context: dict[str, Any]) -> tuple[str, str, str, str]:
    if team_id == context["home_team_id"]:
        return "home", context["home_team_name"], context["away_team_id"], context["away_team_name"]
    if team_id == context["away_team_id"]:
        return "away", context["away_team_name"], context["home_team_id"], context["home_team_name"]
    return "", "", "", ""


def attack_multiplier(team_id: str, period: str, context: dict[str, Any]) -> int | None:
    """Return multiplier that makes attacking direction point to positive x."""
    if team_id not in {context["home_team_id"], context["away_team_id"]} or period not in {"1", "2"}:
        return None
    is_home = team_id == context["home_team_id"]
    first_half_multiplier = -1 if is_home else 1
    return first_half_multiplier if period == "1" else -first_half_multiplier


def orient_coord(x: float | None, y: float | None, multiplier: int | None) -> tuple[float | None, float | None]:
    if x is None or y is None or multiplier is None:
        return None, None
    return x * multiplier, y


def zone_fields(x_oriented: float | None, y_oriented: float | None) -> dict[str, str]:
    if x_oriented is None or y_oriented is None:
        return {
            "third": "",
            "is_defensive_third": "",
            "is_middle_third": "",
            "is_attacking_third": "",
            "is_final_third": "",
            "is_box": "",
            "channel": "",
            "is_left_channel": "",
            "is_central_channel": "",
            "is_right_channel": "",
        }
    if x_oriented < -THIRD_X:
        third = "defensive_third"
    elif x_oriented > THIRD_X:
        third = "attacking_third"
    else:
        third = "middle_third"
    if y_oriented < -CHANNEL_Y:
        channel = "left_channel"
    elif y_oriented > CHANNEL_Y:
        channel = "right_channel"
    else:
        channel = "central_channel"
    is_box = x_oriented >= BOX_X_MIN and abs(y_oriented) <= BOX_HALF_WIDTH
    return {
        "third": third,
        "is_defensive_third": str(third == "defensive_third").lower(),
        "is_middle_third": str(third == "middle_third").lower(),
        "is_attacking_third": str(third == "attacking_third").lower(),
        "is_final_third": str(x_oriented > THIRD_X).lower(),
        "is_box": str(is_box).lower(),
        "channel": channel,
        "is_left_channel": str(channel == "left_channel").lower(),
        "is_central_channel": str(channel == "central_channel").lower(),
        "is_right_channel": str(channel == "right_channel").lower(),
    }


def first_coord(row: dict[str, str], candidates: list[str]) -> tuple[float | None, float | None, str]:
    for field_name in candidates:
        x, y, _z = parse_coord(row.get(field_name, ""))
        if x is not None and y is not None:
            return x, y, field_name
    return None, None, ""


def write_clean_games(context: dict[str, Any]) -> None:
    clean_games = OUTPUTS / "clean_games.csv"
    player_lookup = OUTPUTS / "player_lookup.csv"
    row = {
        "match_id": context["match_id"],
        "game_id_opta": context["game_id_opta"],
        "description": context["description"],
        "match_date": context["date"],
        "home_team_id": context["home_team_id"],
        "home_team_name": context["home_team_name"],
        "home_team_ssi_id": context["home_team_ssi_id"],
        "away_team_id": context["away_team_id"],
        "away_team_name": context["away_team_name"],
        "away_team_ssi_id": context["away_team_ssi_id"],
        "home_players_json": json.dumps(context["home_players"], ensure_ascii=False),
        "away_players_json": json.dumps(context["away_players"], ensure_ascii=False),
        "pitch_length_assumption_m": PITCH_LENGTH,
        "pitch_width_assumption_m": PITCH_WIDTH,
    }
    with clean_games.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(row.keys()))
        writer.writeheader()
        writer.writerow(row)

    lookup_rows = sorted(
        {item["player_id_opta"]: item for item in context["player_lookup"].values() if item.get("player_id_opta")}.values(),
        key=lambda item: (item["team_side"], item["shirt_number"], item["player_name"]),
    )
    fields = [
        "match_id",
        "game_id_opta",
        "team_side",
        "team_id",
        "team_name",
        "player_id_opta",
        "player_id_ssi",
        "player_name",
        "shirt_number",
        "position",
        "opta_uuid",
    ]
    with player_lookup.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerows(lookup_rows)


def prepare_events(context: dict[str, Any]) -> dict[str, int]:
    output = OUTPUTS / "clean_events.csv"
    raw_rows = list(read_csv(INPUTS["events"]))
    if not raw_rows:
        return {"rows": 0, "blank_events": 0}
    original_fields = list(raw_rows[0].keys())
    raw_fields = [f"raw_{snake_case(field)}" for field in original_fields]
    clean_fields = [
        "match_id",
        "game_id_opta",
        "event_id",
        "order",
        "is_blank_event",
        "period",
        "period_second",
        "match_second",
        "match_minute",
        "minute_bin_5",
        "minute_bin_10",
        "frame_idx",
        "start_frame_idx",
        "end_frame_idx",
        "team_id",
        "team_name",
        "team_side",
        "opponent_team_id",
        "opponent_team_name",
        "att_team_id",
        "def_team_id",
        "player_id",
        "player_name",
        "passer_id",
        "receiver_id",
        "shooter_id",
        "poss_id",
        "state_id",
        "phase_id",
        "outcome",
        "phase_type",
        "prev_phase_type",
        "next_phase_type",
        "state",
        "start_type",
        "turnover_type",
        "is_turnover",
        "from_turnover",
        "is_set_play",
        "set_play_type",
        "shot_outcome",
        "xg",
        "x",
        "y",
        "end_x",
        "end_y",
        "coord_source",
        "end_coord_source",
        "x_oriented",
        "y_oriented",
        "end_x_oriented",
        "end_y_oriented",
        "orientation_confidence",
        "third",
        "is_defensive_third",
        "is_middle_third",
        "is_attacking_third",
        "is_final_third",
        "is_box",
        "channel",
        "is_left_channel",
        "is_central_channel",
        "is_right_channel",
    ]
    blank_events = 0
    with output.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=clean_fields + raw_fields)
        writer.writeheader()
        for row in raw_rows:
            is_blank = all(value == "" for key, value in row.items() if key != "order")
            blank_events += int(is_blank)
            normalized = {snake_case(k): v for k, v in row.items()}
            time = temporal_fields(normalized.get("period"), [normalized.get("start_clock"), normalized.get("game_clock")])
            team_id = normalized.get("team_id") or normalized.get("att_team_id") or ""
            side, team_name, opponent_id, opponent_name = team_meta(team_id, context)
            period = time["period"]
            multiplier = attack_multiplier(team_id, period, context)
            x, y, source = first_coord(
                normalized,
                ["pass_loc", "shot_loc", "run_start_loc", "tackle_loc", "location", "start_loc"],
            )
            end_x, end_y, end_source = first_coord(
                normalized,
                ["target_loc", "run_end_loc", "reception_loc", "end_loc"],
            )
            x_o, y_o = orient_coord(x, y, multiplier)
            end_x_o, end_y_o = orient_coord(end_x, end_y, multiplier)
            orientation_confidence = "medium" if multiplier is not None else ""
            player_id = normalized.get("player_id") or normalized.get("passer_id") or normalized.get("shooter_id") or ""
            player_name = context["player_lookup"].get(player_id, {}).get("player_name", "")
            out = {
                "match_id": context["match_id"],
                "game_id_opta": normalized.get("game_id") or context["game_id_opta"],
                "event_id": normalized.get("id", ""),
                "order": normalized.get("order", ""),
                "is_blank_event": str(is_blank).lower(),
                **time,
                "frame_idx": normalized.get("frame_idx", ""),
                "start_frame_idx": normalized.get("start_frame_idx", ""),
                "end_frame_idx": normalized.get("end_frame_idx", ""),
                "team_id": team_id,
                "team_name": team_name,
                "team_side": side,
                "opponent_team_id": opponent_id,
                "opponent_team_name": opponent_name,
                "att_team_id": normalized.get("att_team_id", ""),
                "def_team_id": normalized.get("def_team_id", ""),
                "player_id": player_id,
                "player_name": player_name,
                "passer_id": normalized.get("passer_id", ""),
                "receiver_id": normalized.get("receiver_id", ""),
                "shooter_id": normalized.get("shooter_id", ""),
                "poss_id": normalized.get("poss_id", ""),
                "state_id": normalized.get("state_id", ""),
                "phase_id": normalized.get("phase_id", ""),
                "outcome": normalized.get("outcome", ""),
                "phase_type": normalized.get("phase_type", ""),
                "prev_phase_type": normalized.get("prev_phase_type", ""),
                "next_phase_type": normalized.get("next_phase_type", ""),
                "state": normalized.get("state", ""),
                "start_type": normalized.get("start_type", ""),
                "turnover_type": normalized.get("turnover_type", ""),
                "is_turnover": bool_text(normalized.get("is_turnover", "")),
                "from_turnover": bool_text(normalized.get("from_turnover", "")),
                "is_set_play": bool_text(normalized.get("is_set_play", "")),
                "set_play_type": normalized.get("set_play_type", ""),
                "shot_outcome": normalized.get("shot_outcome", ""),
                "xg": normalized.get("x_g", ""),
                "x": x if x is not None else "",
                "y": y if y is not None else "",
                "end_x": end_x if end_x is not None else "",
                "end_y": end_y if end_y is not None else "",
                "coord_source": source,
                "end_coord_source": end_source,
                "x_oriented": x_o if x_o is not None else "",
                "y_oriented": y_o if y_o is not None else "",
                "end_x_oriented": end_x_o if end_x_o is not None else "",
                "end_y_oriented": end_y_o if end_y_o is not None else "",
                "orientation_confidence": orientation_confidence,
                **zone_fields(x_o, y_o),
            }
            out.update({f"raw_{snake_case(field)}": value for field, value in row.items()})
            writer.writerow(out)
    return {"rows": len(raw_rows), "blank_events": blank_events}


def prepare_tracking(context: dict[str, Any]) -> dict[str, int]:
    output = OUTPUTS / "clean_tracking.csv"
    fields = [
        "match_id",
        "game_id_opta",
        "frame_idx",
        "period",
        "period_second",
        "match_second",
        "match_minute",
        "minute_bin_5",
        "minute_bin_10",
        "team_side",
        "team_id",
        "team_name",
        "player_id_ssi",
        "player_id_opta",
        "player_name",
        "shirt_number",
        "position",
        "x",
        "y",
        "z",
        "speed",
        "x_oriented",
        "y_oriented",
        "z_oriented",
        "orientation_confidence",
        "ball_x",
        "ball_y",
        "ball_z",
        "ball_speed",
        "live",
        "last_touch",
    ]
    output_rows = 0
    frame_rows = 0
    with output.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for row in read_csv(INPUTS["tracking"]):
            frame_rows += 1
            time = temporal_fields(row.get("period"), [row.get("gameClock")])
            period = time["period"]
            ball = safe_literal(row.get("ball", "")) or {}
            ball_xyz = ball.get("xyz") if isinstance(ball, dict) else None
            ball_x = ball_y = ball_z = ""
            if isinstance(ball_xyz, list) and len(ball_xyz) >= 3:
                ball_x, ball_y, ball_z = ball_xyz[0], ball_xyz[1], ball_xyz[2]
            for side_field, side, team_id, team_name in [
                ("homePlayers", "home", context["home_team_id"], context["home_team_name"]),
                ("awayPlayers", "away", context["away_team_id"], context["away_team_name"]),
            ]:
                players = safe_literal(row.get(side_field, "")) or []
                if not isinstance(players, list):
                    continue
                multiplier = attack_multiplier(team_id, period, context)
                for player in players:
                    if not isinstance(player, dict):
                        continue
                    xyz = player.get("xyz")
                    if not isinstance(xyz, list) or len(xyz) < 3:
                        x = y = z = None
                    else:
                        x, y, z = to_float(xyz[0]), to_float(xyz[1]), to_float(xyz[2])
                    x_o, y_o = orient_coord(x, y, multiplier)
                    opta_id = str(player.get("optaId", ""))
                    lookup = context["player_lookup"].get(opta_id, {})
                    writer.writerow(
                        {
                            "match_id": context["match_id"],
                            "game_id_opta": context["game_id_opta"],
                            "frame_idx": row.get("frameIdx", ""),
                            **time,
                            "team_side": side,
                            "team_id": team_id,
                            "team_name": team_name,
                            "player_id_ssi": str(player.get("playerId", "")),
                            "player_id_opta": opta_id,
                            "player_name": lookup.get("player_name", ""),
                            "shirt_number": str(player.get("number", "")),
                            "position": lookup.get("position", ""),
                            "x": x if x is not None else "",
                            "y": y if y is not None else "",
                            "z": z if z is not None else "",
                            "speed": player.get("speed", ""),
                            "x_oriented": x_o if x_o is not None else "",
                            "y_oriented": y_o if y_o is not None else "",
                            "z_oriented": z if z is not None else "",
                            "orientation_confidence": "high" if multiplier is not None else "",
                            "ball_x": ball_x,
                            "ball_y": ball_y,
                            "ball_z": ball_z,
                            "ball_speed": ball.get("speed", "") if isinstance(ball, dict) else "",
                            "live": bool_text(row.get("live", "")),
                            "last_touch": row.get("lastTouch", ""),
                        }
                    )
                    output_rows += 1
    return {"frames": frame_rows, "rows": output_rows}


def write_assumptions(event_stats: dict[str, int], tracking_stats: dict[str, int]) -> None:
    text = f"""# Preparation Assumptions - Phase 2

## Transformations Performed
- Created clean outputs in `outputs/`: `clean_events.csv`, `clean_tracking.csv`, `clean_games.csv`, plus auxiliary `player_lookup.csv`.
- Converted provider column names to `snake_case` in clean outputs while preserving raw eventing fields with a `raw_` prefix.
- Built standard time fields: `period`, `period_second`, `match_second`, `match_minute`, `minute_bin_5`, and `minute_bin_10`.
- Parsed coordinate arrays from eventing and tracking string fields.
- Flattened tracking into player-frame format, producing {tracking_stats.get("rows", 0):,} player-frame rows from {tracking_stats.get("frames", 0):,} tracking frames.
- Preserved all {event_stats.get("rows", 0):,} eventing rows and marked {event_stats.get("blank_events", 0):,} blank analytical rows with `is_blank_event=true`.

## Coordinate and Zone Assumptions
- The pitch coordinate system is centered in meters, based on the Phase 1 audit ranges near x=-56/+56 and y=-40/+38.
- Operational pitch dimensions are set to 112m x 80m.
- Oriented coordinates make the analysed team attack toward positive x.
- FCM is treated as attacking toward negative x in period 1 and positive x in period 2; FCK is treated as the opposite.
- `attacking_third` / `final_third` is defined as `x_oriented > 18.67`; `defensive_third` as `x_oriented < -18.67`.
- The box is approximated as `x_oriented >= 39.5` and `abs(y_oriented) <= 20.16`.
- Channels use `y_oriented`: left `< -13.33`, central between `-13.33` and `13.33`, right `> 13.33`.

## Limitations
- Some eventing locations, especially shot locations, appear already attack-normalized by the provider. Oriented event coordinates therefore carry `orientation_confidence=medium`.
- Tracking orientation is higher confidence because it uses raw team-side pitch positions and the observed halftime side switch.
- Event rows combine multiple provider concepts: passes, receptions, phases, shots, runs, tackles and set pieces. Sparse columns are expected and are not treated as data loss.
- Blank eventing rows are retained for row-level traceability but should normally be filtered out for analysis.
- Player minutes are not directly available; they can be derived later from tracking player-frame presence.
- Python 3.11 is expected by `.python-version`; if `python` is unavailable in PATH, run this script after configuring the interpreter.

## Fields Not Fully Available
- No official expected-threat (`xT`) field is available.
- No complete official pressure-event model is available.
- PPDA and pressure-after-loss should be implemented later only as transparent approximations.
"""
    (DOCS / "preparation_assumptions.md").write_text(text, encoding="utf-8")


def main() -> None:
    OUTPUTS.mkdir(exist_ok=True)
    DOCS.mkdir(exist_ok=True)
    context = load_game_context()
    write_clean_games(context)
    event_stats = prepare_events(context)
    tracking_stats = prepare_tracking(context)
    write_assumptions(event_stats, tracking_stats)
    print("Preparation complete.")
    print(f"Events: {event_stats}")
    print(f"Tracking: {tracking_stats}")


if __name__ == "__main__":
    main()
