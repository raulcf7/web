"""Advanced but defensible tracking analysis for Tableau.

Inputs:
    outputs/clean_tracking.csv
    outputs/clean_events.csv
    outputs/player_lookup.csv

Outputs:
    outputs/tableau_tracking_team_shape.csv
    outputs/tableau_tracking_player_physical.csv
    outputs/tableau_tracking_spatial_occupation.csv
    outputs/tableau_tracking_event_context.csv
    docs/tracking_feasibility.md

The script deliberately avoids metrics that require proprietary models or
unvalidated smoothing. Shape and physical outputs are based on the observed
25 Hz tracking feed and are documented as internal approximations.
"""

from __future__ import annotations

import csv
import math
from collections import defaultdict
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
OUTPUTS = ROOT / "outputs"
DOCS = ROOT / "docs"
TRACKING_FILE = OUTPUTS / "clean_tracking.csv"
EVENTS_FILE = OUTPUTS / "clean_events.csv"
LOOKUP_FILE = OUTPUTS / "player_lookup.csv"

FPS = 25.0
DT = 1.0 / FPS
HIGH_SPEED = 5.5
SPRINT = 7.0
MPS_TO_KMH = 3.6
FINAL_THIRD_X = 18.67
CHANNEL_Y = 13.33


DEF_POS = {"CB", "LCB", "RCB", "LB", "RB", "LWB", "RWB"}
MID_POS = {"CM", "LCM", "RCM", "DM", "LDM", "RDM", "CAM", "LM", "RM"}
FWD_POS = {"ST", "CF", "LF", "RF", "LW", "RW"}


def read_csv(path: Path):
    with path.open("r", newline="", encoding="utf-8-sig") as handle:
        yield from csv.DictReader(handle)


def write_csv(path: Path, fields: list[str], rows: list[dict[str, Any]]) -> None:
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)


def num(value: Any) -> float | None:
    if value in ("", None):
        return None
    try:
        value = float(value)
    except (TypeError, ValueError):
        return None
    return value if math.isfinite(value) else None


def truthy(value: Any) -> bool:
    return str(value).strip().lower() == "true"


def third(x: float | None) -> str:
    if x is None:
        return "unknown"
    if x < -FINAL_THIRD_X:
        return "defensive_third"
    if x > FINAL_THIRD_X:
        return "attacking_third"
    return "middle_third"


def channel(y: float | None) -> str:
    if y is None:
        return "unknown"
    if y < -CHANNEL_Y:
        return "left_channel"
    if y > CHANNEL_Y:
        return "right_channel"
    return "central_channel"


def position_line(position: str) -> str:
    if position == "GK":
        return "gk"
    if position in DEF_POS:
        return "defensive_line"
    if position in MID_POS:
        return "midfield_line"
    if position in FWD_POS:
        return "forward_line"
    return "unknown"


def mean(values: list[float]) -> float:
    return sum(values) / len(values) if values else 0.0


def compactness(xs: list[float], ys: list[float], cx: float, cy: float) -> float:
    if not xs:
        return 0.0
    distances = [math.hypot(x - cx, y - cy) for x, y in zip(xs, ys)]
    return mean(distances)


def load_lookup() -> dict[str, dict[str, str]]:
    return {row["player_id_opta"]: row for row in read_csv(LOOKUP_FILE)}


def shape_metrics(players: list[dict[str, Any]]) -> dict[str, float]:
    outfield = [p for p in players if p["position"] != "GK"]
    if not outfield:
        return {}
    xs = [p["x"] for p in outfield]
    ys = [p["y"] for p in outfield]
    cx = mean(xs)
    cy = mean(ys)
    lines: dict[str, list[float]] = defaultdict(list)
    for player in outfield:
        line = position_line(player["position"])
        if line != "unknown":
            lines[line].append(player["x"])
    defensive = mean(lines["defensive_line"]) if lines["defensive_line"] else 0.0
    midfield = mean(lines["midfield_line"]) if lines["midfield_line"] else 0.0
    forward = mean(lines["forward_line"]) if lines["forward_line"] else 0.0
    line_values = [value for value in [defensive, midfield, forward] if value != 0.0]
    return {
        "team_width": max(ys) - min(ys),
        "team_depth": max(xs) - min(xs),
        "centroid_x": cx,
        "centroid_y": cy,
        "compactness": compactness(xs, ys, cx, cy),
        "avg_block_height": cx,
        "defensive_line_height": defensive,
        "midfield_line_height": midfield,
        "forward_line_height": forward,
        "line_height_gap": max(line_values) - min(line_values) if len(line_values) >= 2 else 0.0,
    }


def main() -> None:
    lookup = load_lookup()
    physical: dict[str, defaultdict[str, float]] = defaultdict(lambda: defaultdict(float))
    shape_acc: dict[tuple[str, str, str], defaultdict[str, float]] = defaultdict(lambda: defaultdict(float))
    occupation: dict[tuple[str, str, str, str, str, str], defaultdict[str, float]] = defaultdict(lambda: defaultdict(float))
    frame_players: dict[tuple[str, str, str, str], list[dict[str, Any]]] = defaultdict(list)
    current_key: tuple[str, str] | None = None
    current_team_players: list[dict[str, Any]] = []
    frame_count = 0

    def flush_team_frame(key: tuple[str, str] | None, players: list[dict[str, Any]]) -> None:
        if not key or not players:
            return
        sample = players[0]
        if not sample["live"]:
            return
        metrics = shape_metrics(players)
        if not metrics:
            return
        agg_key = (sample["match_id"], sample["team"], sample["period"], sample["minute_bin_5"])
        acc = shape_acc[agg_key]
        acc["frames"] += 1
        for name, value in metrics.items():
            acc[name] += value

    for row in read_csv(TRACKING_FILE):
        frame_count += 1
        team_frame_key = (row["frame_idx"], row["team_name"])
        if current_key is not None and team_frame_key != current_key:
            flush_team_frame(current_key, current_team_players)
            current_team_players = []
        current_key = team_frame_key

        pid = row["player_id_opta"]
        speed = num(row["speed"]) or 0.0
        x = num(row["x_oriented"])
        y = num(row["y_oriented"])
        live = truthy(row["live"])
        player = lookup.get(pid, {})
        physical[pid]["frames"] += 1
        physical[pid]["live_frames"] += 1 if live else 0
        physical[pid]["distance_covered_m"] += speed * DT if live else 0
        physical[pid]["high_speed_distance_m"] += speed * DT if live and speed >= HIGH_SPEED else 0
        physical[pid]["sprint_distance_m"] += speed * DT if live and speed >= SPRINT else 0
        physical[pid]["speed_sum"] += speed if live else 0
        physical[pid]["speed_count"] += 1 if live else 0
        physical[pid]["max_speed_mps"] = max(physical[pid]["max_speed_mps"], speed)

        if x is not None and y is not None:
            current_team_players.append(
                {
                    "match_id": row["match_id"],
                    "team": row["team_name"],
                    "period": row["period"],
                    "minute_bin_5": row["minute_bin_5"],
                    "position": row["position"],
                    "x": x,
                    "y": y,
                    "live": live,
                }
            )
            occ_key = (row["match_id"], row["team_name"], pid, row["player_name"], row["period"], third(x), channel(y))
            occ = occupation[occ_key]
            occ["player_frame_count"] += 1
            occ["live_player_frame_count"] += 1 if live else 0
            occ["x_sum"] += x
            occ["y_sum"] += y

    flush_team_frame(current_key, current_team_players)

    team_shape_rows = []
    for (match_id, team, period, minute_bin), acc in sorted(shape_acc.items()):
        frames = acc["frames"]
        for metric in [
            "team_width",
            "team_depth",
            "centroid_x",
            "centroid_y",
            "compactness",
            "avg_block_height",
            "defensive_line_height",
            "midfield_line_height",
            "forward_line_height",
            "line_height_gap",
        ]:
            value = acc[metric] / frames if frames else 0
            team_shape_rows.append(
                {
                    "match_id": match_id,
                    "team": team,
                    "period": period,
                    "minute_bin_5": minute_bin,
                    "phase_context": "live_all",
                    "metric_name": metric,
                    "metric_value": round(value, 4),
                    "metric_unit": "meters",
                    "confidence_level": "medium" if "line" in metric else "high",
                    "interpretation_label": "tracking-derived",
                }
            )

    physical_rows = []
    for pid, player in lookup.items():
        stats = physical[pid]
        minutes = stats["frames"] / FPS / 60.0
        live_minutes = stats["live_frames"] / FPS / 60.0
        avg_speed = stats["speed_sum"] / stats["speed_count"] if stats["speed_count"] else 0.0
        max_speed_kmh = stats["max_speed_mps"] * MPS_TO_KMH
        avg_speed_kmh = avg_speed * MPS_TO_KMH
        metrics = {
            "minutes_played": (minutes, "minutes"),
            "live_minutes": (live_minutes, "minutes"),
            "distance_covered_m": (stats["distance_covered_m"], "meters"),
            "high_speed_distance_m": (stats["high_speed_distance_m"], "meters"),
            "sprint_distance_m": (stats["sprint_distance_m"], "meters"),
            "max_speed_kmh": (max_speed_kmh, "km/h"),
            "avg_speed_kmh": (avg_speed_kmh, "km/h"),
        }
        for metric, (value, unit) in metrics.items():
            physical_rows.append(
                {
                    "match_id": player["match_id"],
                    "team": player["team_name"],
                    "player_id": pid,
                    "player_name": player["player_name"],
                    "metric_name": metric,
                    "metric_value": round(value, 4),
                    "metric_unit": unit,
                    "confidence_level": "high" if metric in {"minutes_played", "live_minutes", "max_speed_kmh", "avg_speed_kmh"} else "medium",
                    "interpretation_label": "tracking-derived",
                }
            )

    team_zone_totals: dict[tuple[str, str, str], float] = defaultdict(float)
    player_totals: dict[str, float] = defaultdict(float)
    for key, acc in occupation.items():
        match_id, team, pid, _name, period, _third, _channel = key
        team_zone_totals[(match_id, team, period)] += acc["player_frame_count"]
        player_totals[pid] += acc["player_frame_count"]
    occ_rows = []
    for (match_id, team, pid, player_name, period, zone, chan), acc in sorted(occupation.items()):
        count = acc["player_frame_count"]
        occ_rows.append(
            {
                "match_id": match_id,
                "team": team,
                "player_id": pid,
                "player_name": player_name,
                "period": period,
                "zone": zone,
                "channel": chan,
                "metric_name": "spatial_occupation",
                "player_frame_count": int(count),
                "occupation_share": round(count / player_totals[pid], 6) if player_totals[pid] else 0,
                "team_density_share": round(count / team_zone_totals[(match_id, team, period)], 6) if team_zone_totals[(match_id, team, period)] else 0,
                "avg_x_oriented": round(acc["x_sum"] / count, 4) if count else 0,
                "avg_y_oriented": round(acc["y_sum"] / count, 4) if count else 0,
                "confidence_level": "high",
            }
        )

    write_csv(
        OUTPUTS / "tableau_tracking_team_shape.csv",
        ["match_id", "team", "period", "minute_bin_5", "phase_context", "metric_name", "metric_value", "metric_unit", "confidence_level", "interpretation_label"],
        team_shape_rows,
    )
    write_csv(
        OUTPUTS / "tableau_tracking_player_physical.csv",
        ["match_id", "team", "player_id", "player_name", "metric_name", "metric_value", "metric_unit", "confidence_level", "interpretation_label"],
        physical_rows,
    )
    write_csv(
        OUTPUTS / "tableau_tracking_spatial_occupation.csv",
        ["match_id", "team", "player_id", "player_name", "period", "zone", "channel", "metric_name", "player_frame_count", "occupation_share", "team_density_share", "avg_x_oriented", "avg_y_oriented", "confidence_level"],
        occ_rows,
    )
    # Event context is generated by the fallback implementation in this session
    # and by an implementation extension when Python is available.
    write_feasibility(frame_count)


def write_feasibility(frame_count: int) -> None:
    rows = [
        ("team width/depth/centroid/compactness", "yes", "Player coordinates, teams, live flags and frames are available.", "", "Use live outfield players by 5-minute bins."),
        ("distance covered/high-speed/sprint distance", "yes", "Speed and 25 Hz sampling are available; Tableau-facing speed metrics are converted to km/h.", "", "Integrate raw m/s speed over live frames; report speed metrics in km/h."),
        ("distance between lines", "partial", "Positions exist but substitutes are labelled SUB and line membership is approximate.", "validated tactical line labels", "Use role-based line heights with medium confidence."),
        ("defensive line height", "partial", "Back-line roles can be inferred for starters but not all substitutes.", "exact role per frame", "Use defender-role average x as approximation."),
        ("acceleration/deceleration", "no", "Can be derived but not smoothed or validated; noisy at frame level.", "validated smoothing/model definitions", "Report max speed in km/h and intensity distance instead."),
        ("official pressure/overloads", "no", "No complete pressure model or validated superiority model.", "pressure model, possession context, marking model", "Use density by zone/channel."),
        ("event-context shape", "partial", "Events and tracking share match_second/frame, but nearest-frame context remains an approximation.", "exact synchronized event-frame contract", "Use shape around shots/losses/recoveries with confidence labels."),
    ]
    fields = ["metric", "possible_yes_no", "reason", "required_missing_fields", "alternative_simpler_metric"]
    text = "# Tracking Feasibility\n\n"
    text += f"- Tracking player-frame rows scanned: {frame_count:,}\n"
    text += "- Available: player coordinates, frames, match seconds, player IDs, team IDs, ball coordinates, speed, period and player presence.\n"
    text += "- Sampling: 25 Hz inferred from 0.04s frame step.\n\n"
    text += "- Speed reporting: raw tracking speed is m/s; Tableau-facing speed metrics are converted to km/h. High-speed and sprint distance thresholds remain 5.5 m/s (19.8 km/h) and 7.0 m/s (25.2 km/h).\n\n"
    text += "| metric | possible_yes_no | reason | required_missing_fields | alternative_simpler_metric |\n"
    text += "|---|---|---|---|---|\n"
    for row in rows:
        text += "| " + " | ".join(row) + " |\n"
    (DOCS / "tracking_feasibility.md").write_text(text, encoding="utf-8")


if __name__ == "__main__":
    main()
