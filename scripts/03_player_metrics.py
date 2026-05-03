"""Build player metrics, rankings and interpretive profiles for Tableau.

Inputs:
    outputs/clean_events.csv
    outputs/clean_tracking.csv
    outputs/player_lookup.csv

Outputs:
    outputs/tableau_player_metrics.csv
    outputs/tableau_player_profiles.csv
    docs/player_metrics_methodology.md

The script uses only the Python standard library. It treats every profile as a
within-match, within-team interpretation, not an external benchmark.
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
LOOKUP_FILE = OUTPUTS / "player_lookup.csv"
EVENTS_FILE = OUTPUTS / "clean_events.csv"
TRACKING_FILE = OUTPUTS / "clean_tracking.csv"
METRICS_FILE = OUTPUTS / "tableau_player_metrics.csv"
PROFILES_FILE = OUTPUTS / "tableau_player_profiles.csv"
METHODOLOGY_FILE = DOCS / "player_metrics_methodology.md"

FINAL_THIRD_X = 18.67
BOX_X = 39.5
FPS = 25.0
BALL_WIN_WINDOW = 10.0

RISK_METRICS = {
    "turnovers",
    "dangerous_losses",
    "losses_in_own_half",
    "central_losses",
    "loss_risk_per_action",
}


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


def is_action(row: dict[str, str]) -> bool:
    return row.get("is_blank_event") != "true" and bool(row.get("team_name"))


def actor_id(row: dict[str, str]) -> str:
    return row.get("player_id") or row.get("passer_id") or row.get("shooter_id") or row.get("raw_tackler_id") or row.get("raw_interceptor_id") or ""


def is_pass(row: dict[str, str]) -> bool:
    return row.get("coord_source") == "pass_loc" or row.get("passer_id") != ""


def is_completed(row: dict[str, str]) -> bool:
    return truthy(row.get("raw_completed")) or row.get("outcome") == "completed_pass"


def is_shot(row: dict[str, str]) -> bool:
    return row.get("shooter_id") != "" or row.get("shot_outcome") != "" or row.get("coord_source") == "shot_loc"


def is_shot_on_target(row: dict[str, str]) -> bool:
    return row.get("shot_outcome") in {"goal", "save"}


def vertical_gain(row: dict[str, str]) -> float:
    x = num(row.get("x_oriented"))
    end_x = num(row.get("end_x_oriented"))
    if x is None or end_x is None:
        return 0.0
    return max(0.0, end_x - x)


def is_progressive(row: dict[str, str]) -> bool:
    return vertical_gain(row) >= 10.0


def starts_outside_final_third(row: dict[str, str]) -> bool:
    return (num(row.get("x_oriented")) or -999) <= FINAL_THIRD_X


def ends_final_third(row: dict[str, str]) -> bool:
    return (num(row.get("end_x_oriented")) or -999) > FINAL_THIRD_X


def ends_box(row: dict[str, str]) -> bool:
    end_x = num(row.get("end_x_oriented"))
    end_y = num(row.get("end_y_oriented"))
    return end_x is not None and end_y is not None and end_x >= BOX_X and abs(end_y) <= 20.16


def is_box_action(row: dict[str, str]) -> bool:
    return truthy(row.get("is_box")) or ends_box(row)


def is_recovery(row: dict[str, str]) -> bool:
    labels = {row.get("start_type", ""), row.get("turnover_type", ""), row.get("outcome", ""), row.get("raw_interception_type", "")}
    return bool(labels & {"recovery", "interception", "tackle", "shot_recovered", "anticipated", "reacted", "passive"})


def is_loss(row: dict[str, str]) -> bool:
    return truthy(row.get("is_turnover")) or row.get("outcome") in {"turnover", "ball_lost", "lost_ball"}


def threat_weight(x: float | None, y: float | None) -> float:
    if x is None:
        return 0.0
    abs_y = abs(y if y is not None else 99.0)
    if x >= BOX_X and abs_y <= 20.16:
        return 0.18
    if x > FINAL_THIRD_X:
        return 0.08
    if x >= -FINAL_THIRD_X:
        return 0.03
    return 0.01


def threat_value(row: dict[str, str]) -> float:
    xg = num(row.get("xg"))
    if is_shot(row) and xg is not None:
        return xg
    start = threat_weight(num(row.get("x_oriented")), num(row.get("y_oriented")))
    end_x = num(row.get("end_x_oriented"))
    end_y = num(row.get("end_y_oriented"))
    if end_x is None or end_y is None:
        return 0.0
    return max(0.0, threat_weight(end_x, end_y) - start)


def load_players() -> dict[str, dict[str, Any]]:
    players: dict[str, dict[str, Any]] = {}
    for row in read_csv(LOOKUP_FILE):
        player_id = row["player_id_opta"]
        players[player_id] = {
            "match_id": row["match_id"],
            "team": row["team_name"],
            "player_id": player_id,
            "player_name": row["player_name"],
            "position": row.get("position", ""),
            "values": defaultdict(float),
            "minutes_played": 0.0,
            "live_minutes": 0.0,
        }
    return players


def enrich_event_team_names(events: list[dict[str, str]], player_team: dict[str, str]) -> int:
    """Fill missing team_name from player IDs present in the lookup.

    Returns the number of events enriched.
    """
    enriched = 0
    for row in events:
        if row.get("team_name"):
            continue
        for field in ("player_id", "passer_id", "shooter_id", "raw_tackler_id",
                      "raw_interceptor_id", "raw_presser_id"):
            pid = row.get(field, "")
            if pid and pid in player_team:
                row["team_name"] = player_team[pid]
                enriched += 1
                break
    return enriched


def merge_shot_outcomes(events: list[dict[str, str]]) -> int:
    """Copy shot_outcome from adjacent outcome-only rows to shooter rows.

    In the source data each shot produces two rows:
      - Row A: has shooter_id but no shot_outcome
      - Row B: has shot_outcome but no shooter_id
    This function copies the outcome onto the shooter row so that
    is_shot_on_target() works correctly.

    Returns the number of merges performed.
    """
    merged = 0
    outcome_used: set[int] = set()
    for i, row in enumerate(events):
        if not row.get("shooter_id") or row.get("shot_outcome"):
            continue
        for j in range(max(0, i - 3), min(len(events), i + 4)):
            if j == i or j in outcome_used:
                continue
            neighbor = events[j]
            if neighbor.get("shot_outcome") and not neighbor.get("shooter_id"):
                row["shot_outcome"] = neighbor["shot_outcome"]
                outcome_used.add(j)
                merged += 1
                break
    return merged


def add_value(players: dict[str, dict[str, Any]], player_id: str, key: str, value: float = 1.0) -> None:
    if player_id in players:
        players[player_id]["values"][key] += value


def add_event_metrics(players: dict[str, dict[str, Any]]) -> None:
    # Build player→team map for enriching events that lack team_name.
    player_team = {pid: p["team"] for pid, p in players.items()}

    # Load ALL non-blank events before filtering.
    all_events = [row for row in read_csv(EVENTS_FILE) if row.get("is_blank_event") != "true"]

    # --- Enrichment pass 1: fill missing team_name from any known player ID.
    n_enriched = enrich_event_team_names(all_events, player_team)
    print(f"  enriched team_name on {n_enriched} events")

    # --- Enrichment pass 2: merge shot outcomes onto shooter rows.
    n_merged = merge_shot_outcomes(all_events)
    print(f"  merged shot_outcome on {n_merged} shots")

    # Now apply the action filter.
    events = [row for row in all_events if is_action(row)]
    events_sorted = sorted(
        [row for row in events if num(row.get("match_second")) is not None],
        key=lambda row: num(row["match_second"]) or 0,
    )
    for row in events:
        aid = actor_id(row)
        if not aid:
            continue
        add_value(players, aid, "total_actions")
        add_value(players, aid, "attacking_third_actions", 1 if truthy(row.get("is_attacking_third")) else 0)
        add_value(players, aid, "box_actions", 1 if is_box_action(row) else 0)
        add_value(players, aid, "defensive_involvement", 1 if is_recovery(row) or row.get("raw_tackle_id") else 0)
        add_value(players, aid, "attacking_involvement", 1 if truthy(row.get("is_attacking_third")) or is_pass(row) or is_shot(row) else 0)

        gain = vertical_gain(row)
        add_value(players, aid, "vertical_distance_gained", gain)
        add_value(players, aid, "final_third_entries", 1 if starts_outside_final_third(row) and ends_final_third(row) else 0)
        if row.get("channel") == "left_channel":
            add_value(players, aid, "left_channel_actions")
        elif row.get("channel") == "central_channel":
            add_value(players, aid, "central_channel_actions")
        elif row.get("channel") == "right_channel":
            add_value(players, aid, "right_channel_actions")

        if is_loss(row):
            add_value(players, aid, "turnovers")
            add_value(players, aid, "dangerous_losses", 1 if row.get("channel") == "central_channel" and (num(row.get("x_oriented")) or 0) < FINAL_THIRD_X else 0)
            add_value(players, aid, "losses_in_own_half", 1 if (num(row.get("x_oriented")) or 0) < 0 else 0)
            add_value(players, aid, "central_losses", 1 if row.get("channel") == "central_channel" else 0)

        if is_recovery(row):
            add_value(players, aid, "recoveries")
            add_value(players, aid, "high_recoveries", 1 if truthy(row.get("is_attacking_third")) else 0)
            add_value(players, aid, "defensive_actions_attacking_half", 1 if (num(row.get("x_oriented")) or -999) > 0 else 0)
        if row.get("outcome") == "interception" or row.get("start_type") == "interception" or row.get("turnover_type") == "interception":
            add_value(players, aid, "interceptions")
        # Tackle detection from action rows (start_type / turnover_type).
        if row.get("start_type") == "tackle" or row.get("turnover_type") == "tackle":
            add_value(players, aid, "tackles")

        if is_shot(row):
            sid = row.get("shooter_id") or aid
            add_value(players, sid, "shots")
            add_value(players, sid, "shots_on_target", 1 if is_shot_on_target(row) else 0)
            add_value(players, sid, "shots_from_box", 1 if truthy(row.get("is_box")) else 0)
            shot_distance = num(row.get("raw_goal_dist"))
            if shot_distance is not None:
                add_value(players, sid, "shot_distance_sum", shot_distance)
                add_value(players, sid, "shot_distance_count")
            add_value(players, sid, "shot_threat", threat_value(row))

        if is_pass(row):
            pid = row.get("passer_id") or aid
            add_value(players, pid, "progressive_passes", 1 if is_completed(row) and is_progressive(row) else 0)
            add_value(players, pid, "passes_into_final_third", 1 if ends_final_third(row) else 0)
            add_value(players, pid, "passes_into_box", 1 if ends_box(row) else 0)
            add_value(players, pid, "final_third_passes", 1 if ends_final_third(row) else 0)
            add_value(players, pid, "key_passes", 1 if (num(row.get("raw_xg_created")) or 0) > 0 or truthy(row.get("raw_led_to_shot")) else 0)
            add_value(players, pid, "chances_created_proxy", 1 if (num(row.get("raw_xg_created")) or 0) > 0 or truthy(row.get("raw_led_to_shot")) else 0)

        if row.get("coord_source") == "run_start_loc":
            add_value(players, aid, "progressive_carries", 1 if is_progressive(row) else 0)
            add_value(players, aid, "carries_into_final_third", 1 if ends_final_third(row) else 0)

        contribution_id = row.get("shooter_id") if is_shot(row) and row.get("shooter_id") else (row.get("passer_id") if is_pass(row) and row.get("passer_id") else aid)
        add_value(players, contribution_id, "threat_contribution", threat_value(row))
        add_value(players, contribution_id, "xt_proxy_generated", threat_value(row))

    # --- Separate tackle pass: use raw_tackle_id events with raw_presser_id.
    # These events carry the tackle context but lack standard player_id fields.
    # The raw_presser_id identifies the player who executed the tackle.
    seen_tackle_ids: set[str] = set()
    for row in all_events:
        tackle_id = row.get("raw_tackle_id", "")
        if not tackle_id or tackle_id in seen_tackle_ids:
            continue
        presser = row.get("raw_presser_id", "")
        if presser and presser in players:
            add_value(players, presser, "tackles")
            seen_tackle_ids.add(tackle_id)
    if seen_tackle_ids:
        print(f"  attributed {len(seen_tackle_ids)} tackles from raw_tackle_id events")

    # Ball wins followed by progression within 10 seconds.
    for i, row in enumerate(events_sorted):
        if not is_recovery(row):
            continue
        aid = actor_id(row)
        if not aid:
            continue
        current = num(row["match_second"]) or 0
        for nxt in events_sorted[i + 1 : i + 60]:
            if (num(nxt.get("match_second")) or 99999) - current > BALL_WIN_WINDOW:
                break
            if nxt.get("team_name") == row.get("team_name") and (is_progressive(nxt) or ends_final_third(nxt)):
                add_value(players, aid, "ball_wins_leading_to_progression")
                break


def add_minutes(players: dict[str, dict[str, Any]]) -> None:
    frame_counts: dict[str, int] = defaultdict(int)
    live_counts: dict[str, int] = defaultdict(int)
    for row in read_csv(TRACKING_FILE):
        player_id = row.get("player_id_opta", "")
        if not player_id:
            continue
        frame_counts[player_id] += 1
        if truthy(row.get("live")):
            live_counts[player_id] += 1
    for player_id, player in players.items():
        player["minutes_played"] = frame_counts[player_id] / FPS / 60.0
        player["live_minutes"] = live_counts[player_id] / FPS / 60.0
        player["values"]["minutes_played"] = player["minutes_played"]
        player["values"]["live_minutes"] = player["live_minutes"]


def derive_ratios(players: dict[str, dict[str, Any]]) -> None:
    team_totals: dict[str, defaultdict[str, float]] = defaultdict(lambda: defaultdict(float))
    for player in players.values():
        team = player["team"]
        for key, value in player["values"].items():
            team_totals[team][key] += value
    for player in players.values():
        values = player["values"]
        minutes = player["minutes_played"]
        actions = values["total_actions"]
        values["involvement_share"] = actions / team_totals[player["team"]]["total_actions"] if team_totals[player["team"]]["total_actions"] else 0
        values["progression_contribution_share"] = values["vertical_distance_gained"] / team_totals[player["team"]]["vertical_distance_gained"] if team_totals[player["team"]]["vertical_distance_gained"] else 0
        values["loss_risk_per_action"] = values["turnovers"] / actions if actions else 0
        values["threat_per_action"] = values["threat_contribution"] / actions if actions else 0
        values["average_shot_distance"] = values["shot_distance_sum"] / values["shot_distance_count"] if values["shot_distance_count"] else 0
        for key in [
            "total_actions",
            "progressive_passes",
            "progressive_carries",
            "key_passes",
            "shots",
            "recoveries",
            "interceptions",
            "tackles",
            "threat_contribution",
            "turnovers",
        ]:
            values[f"{key}_per_90"] = values[key] / minutes * 90 if minutes else 0
            values[f"{key}_per_30"] = values[key] / minutes * 30 if minutes else 0


METRIC_SPECS = [
    ("Participation", "minutes_played", "minutes"),
    ("Participation", "live_minutes", "minutes"),
    ("Participation", "total_actions", "count"),
    ("Participation", "total_actions_per_90", "per_90"),
    ("Participation", "involvement_share", "share"),
    ("Participation", "attacking_third_actions", "count"),
    ("Participation", "box_actions", "count"),
    ("Participation", "attacking_involvement", "count"),
    ("Participation", "defensive_involvement", "count"),
    ("Participation", "left_channel_actions", "count"),
    ("Participation", "central_channel_actions", "count"),
    ("Participation", "right_channel_actions", "count"),
    ("Progression", "progressive_passes", "count"),
    ("Progression", "progressive_passes_per_90", "per_90"),
    ("Progression", "progressive_carries", "count"),
    ("Progression", "progressive_carries_per_90", "per_90"),
    ("Progression", "final_third_entries", "count"),
    ("Progression", "passes_into_final_third", "count"),
    ("Progression", "carries_into_final_third", "count"),
    ("Progression", "vertical_distance_gained", "meters"),
    ("Progression", "progression_contribution_share", "share"),
    ("Creation", "key_passes", "count"),
    ("Creation", "key_passes_per_90", "per_90"),
    ("Creation", "passes_into_box", "count"),
    ("Creation", "threat_contribution", "threat"),
    ("Creation", "threat_contribution_per_90", "per_90"),
    ("Creation", "threat_per_action", "ratio"),
    ("Creation", "xt_proxy_generated", "threat"),
    ("Creation", "chances_created_proxy", "count"),
    ("Finishing", "shots", "count"),
    ("Finishing", "shots_per_90", "per_90"),
    ("Finishing", "shots_on_target", "count"),
    ("Finishing", "shots_from_box", "count"),
    ("Finishing", "average_shot_distance", "meters"),
    ("Finishing", "shot_threat", "threat"),
    ("Risk", "turnovers", "count"),
    ("Risk", "turnovers_per_90", "per_90"),
    ("Risk", "dangerous_losses", "count"),
    ("Risk", "losses_in_own_half", "count"),
    ("Risk", "central_losses", "count"),
    ("Risk", "loss_risk_per_action", "ratio"),
    ("Defence", "recoveries", "count"),
    ("Defence", "recoveries_per_90", "per_90"),
    ("Defence", "interceptions", "count"),
    ("Defence", "interceptions_per_90", "per_90"),
    ("Defence", "tackles", "count"),
    ("Defence", "tackles_per_90", "per_90"),
    ("Defence", "high_recoveries", "count"),
    ("Defence", "defensive_actions_attacking_half", "count"),
    ("Defence", "ball_wins_leading_to_progression", "count"),
]


def percentile(values: list[float], value: float) -> float:
    if len(values) <= 1:
        return 100.0
    less = sum(1 for item in values if item < value)
    equal = sum(1 for item in values if item == value)
    return (less + 0.5 * equal) / len(values) * 100


def labels(metric: str, pct: float, value: float) -> str:
    if metric in RISK_METRICS:
        if pct >= 75:
            return "high risk"
        if pct <= 25:
            return "secure"
        return "moderate risk"
    if value == 0:
        return "none"
    if pct >= 75:
        return "team leading"
    if pct >= 50:
        return "above team median"
    if pct <= 25:
        return "low"
    return "around team median"


def build_metric_rows(players: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    by_team = defaultdict(list)
    for player in players.values():
        by_team[player["team"]].append(player)
    for group, metric, unit in METRIC_SPECS:
        for team, team_players in by_team.items():
            vals = [p["values"][metric] for p in team_players]
            sorted_vals = sorted(vals, reverse=metric not in RISK_METRICS)
            for player in team_players:
                value = player["values"][metric]
                pct = percentile(vals, value)
                if metric in RISK_METRICS:
                    rank = sorted(vals).index(value) + 1
                else:
                    rank = sorted_vals.index(value) + 1
                label = labels(metric, pct, value)
                rows.append(
                    {
                        "match_id": player["match_id"],
                        "team": player["team"],
                        "player_id": player["player_id"],
                        "player_name": player["player_name"],
                        "metric_group": group,
                        "metric_name": metric,
                        "metric_value": round(value, 4),
                        "metric_unit": unit,
                        "percentile_within_team": round(pct, 2),
                        "rank_within_team": rank,
                        "interpretation_label": label,
                        "insight_text": f"{player['player_name']} ranks {rank} within {team} for {metric.replace('_', ' ')} ({label}).",
                    }
                )
    return rows


def pctl(player: dict[str, Any], metrics_rows: list[dict[str, Any]], metric: str) -> float:
    for row in metrics_rows:
        if row["player_id"] == player["player_id"] and row["metric_name"] == metric:
            return float(row["percentile_within_team"])
    return 0.0


def build_profiles(players: dict[str, dict[str, Any]], metric_rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    profiles = []
    for player in players.values():
        values = player["values"]
        position = player.get("position", "")
        is_gk = position == "GK"
        scores = {
            "Progression hub": max(pctl(player, metric_rows, "progressive_passes"), pctl(player, metric_rows, "progressive_carries"), pctl(player, metric_rows, "vertical_distance_gained"), pctl(player, metric_rows, "progression_contribution_share")),
            "Final-third connector": max(pctl(player, metric_rows, "final_third_entries"), pctl(player, metric_rows, "passes_into_final_third"), pctl(player, metric_rows, "key_passes")),
            "High-risk creator": min(max(pctl(player, metric_rows, "threat_contribution"), pctl(player, metric_rows, "key_passes")), max(pctl(player, metric_rows, "loss_risk_per_action"), pctl(player, metric_rows, "dangerous_losses"))),
            "Secure circulator": min(pctl(player, metric_rows, "involvement_share"), 100 - pctl(player, metric_rows, "loss_risk_per_action")),
            "Defensive ball-winner": max(pctl(player, metric_rows, "recoveries"), pctl(player, metric_rows, "interceptions"), pctl(player, metric_rows, "tackles"), pctl(player, metric_rows, "high_recoveries")),
            "Transition outlet": max(pctl(player, metric_rows, "progressive_carries"), pctl(player, metric_rows, "ball_wins_leading_to_progression"), pctl(player, metric_rows, "vertical_distance_gained")),
            "Box threat": max(pctl(player, metric_rows, "shots_from_box"), pctl(player, metric_rows, "shot_threat"), pctl(player, metric_rows, "box_actions")),
            "Low involvement": 100 - pctl(player, metric_rows, "involvement_share") if player["minutes_played"] >= 20 else 0,
        }
        if is_gk:
            for attacking_profile in ["Progression hub", "Final-third connector", "High-risk creator", "Transition outlet", "Box threat"]:
                scores[attacking_profile] = 0
        ordered = sorted(scores.items(), key=lambda item: item[1], reverse=True)
        primary = ordered[0][0] if ordered[0][1] >= 55 else "Balanced role"
        secondary = ordered[1][0] if ordered[1][1] >= 55 and ordered[1][0] != primary else ""
        strengths = []
        risks = []
        for metric in ["progressive_passes", "threat_contribution", "recoveries", "shots", "involvement_share"]:
            pct = pctl(player, metric_rows, metric)
            if pct >= 75:
                strengths.append(metric.replace("_", " "))
        for metric in ["loss_risk_per_action", "dangerous_losses", "central_losses"]:
            pct = pctl(player, metric_rows, metric)
            if pct >= 75 and values[metric] > 0:
                risks.append(metric.replace("_", " "))
        if not strengths:
            strengths.append("balanced contribution")
        if not risks:
            risks.append("no standout risk flag")
        staff_note = f"{player['player_name']} profiles as {primary.lower()}."
        if risks and risks[0] != "no standout risk flag":
            staff_note += f" Monitor {', '.join(risks[:2])}."
        profiles.append(
            {
                "match_id": player["match_id"],
                "team": player["team"],
                "player_id": player["player_id"],
                "player_name": player["player_name"],
                "primary_profile": primary,
                "secondary_profile": secondary,
                "strengths": "; ".join(strengths[:4]),
                "risks": "; ".join(risks[:3]),
                "staff_note": staff_note,
            }
        )
    return profiles


def write_methodology() -> None:
    METHODOLOGY_FILE.write_text(
        """# Player Metrics Methodology

## Data Sources
- Player technical metrics come from `outputs/clean_events.csv`.
- Minutes are estimated from `outputs/clean_tracking.csv` using player-frame presence at 25 Hz.
- Player names, teams and positions come from `outputs/player_lookup.csv`.

## Normalisation
- `minutes_played = player_frame_count / 25 / 60`.
- Per-90 and per-30 metrics use tracking-estimated minutes rather than official match minutes.
- Shares are calculated inside each team, not across both teams.
- Percentiles and ranks are within-team so players are compared with teammates in the same match context.

## Profile Definitions
- **Progression hub**: high within-team percentile for progressive passes, progressive carries, vertical distance gained or progression share.
- **Final-third connector**: high final-third entries, passes into final third or key-pass proxy.
- **High-risk creator**: combines creation/threat percentile with risk percentile.
- **Secure circulator**: high involvement with low loss-risk percentile.
- **Defensive ball-winner**: high recoveries, interceptions, tackles or high recoveries.
- **Transition outlet**: high progressive carries, ball wins leading to progression or vertical gain.
- **Box threat**: high shots from box, shot threat or box actions.
- **Low involvement**: 20+ tracking minutes with low involvement share.

## Limitations
- Event data mixes phases, passes, carries, shots, defensive actions and provider-derived events, so event totals should be read as involvement proxies.
- Pressure is not treated as an official metric because a complete pressure-event model is not available.
- Oriented event coordinates are useful for tactical tendencies but carry medium confidence because some provider event locations appear attack-normalised.
- Profiles are descriptive labels for this match only, not stable player archetypes.
- Goalkeepers are not assigned attacking progression/box-threat profiles from circulation volume; their profiles are limited to secure circulation, defensive ball-winning, low involvement or balanced role.

## Tableau Usage
- Use `tableau_player_metrics.csv` for sortable rankings, percentile bars and role-specific metric selectors.
- Use `tableau_player_profiles.csv` for a staff-facing player impact panel with strengths, risks and concise notes.
""",
        encoding="utf-8",
    )


def main() -> None:
    players = load_players()
    add_event_metrics(players)
    add_minutes(players)
    derive_ratios(players)
    metric_rows = build_metric_rows(players)
    profile_rows = build_profiles(players, metric_rows)
    write_csv(
        METRICS_FILE,
        [
            "match_id",
            "team",
            "player_id",
            "player_name",
            "metric_group",
            "metric_name",
            "metric_value",
            "metric_unit",
            "percentile_within_team",
            "rank_within_team",
            "interpretation_label",
            "insight_text",
        ],
        metric_rows,
    )
    write_csv(
        PROFILES_FILE,
        [
            "match_id",
            "team",
            "player_id",
            "player_name",
            "primary_profile",
            "secondary_profile",
            "strengths",
            "risks",
            "staff_note",
        ],
        profile_rows,
    )
    write_methodology()
    print(f"Wrote {METRICS_FILE}")
    print(f"Wrote {PROFILES_FILE}")
    print(f"Wrote {METHODOLOGY_FILE}")


if __name__ == "__main__":
    main()
