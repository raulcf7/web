"""Build team-level post-match metrics and insight flags for Tableau.

Inputs:
    outputs/clean_events.csv
    outputs/clean_games.csv

Outputs:
    outputs/tableau_match_summary.csv
    outputs/tableau_team_period_metrics.csv
    outputs/tableau_team_zone_metrics.csv
    outputs/tableau_momentum_timeline.csv
    outputs/tableau_insight_flags.csv
    docs/metric_definitions.md

The calculations are intentionally transparent. They favor defensible football
reading over decorative metrics, and every row includes interpretation fields
for Tableau storytelling.
"""

from __future__ import annotations

import csv
from collections import Counter, defaultdict
from pathlib import Path
from statistics import mean
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
OUTPUTS = ROOT / "outputs"
DOCS = ROOT / "docs"
EVENTS_FILE = OUTPUTS / "clean_events.csv"
GAMES_FILE = OUTPUTS / "clean_games.csv"

FINAL_THIRD_X = 18.67
BOX_X = 39.5
TRANSITION_WINDOW = 10.0
SHOT_WINDOW = 15.0


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open("r", newline="", encoding="utf-8-sig") as handle:
        return list(csv.DictReader(handle))


def write_csv(path: Path, fields: list[str], rows: list[dict[str, Any]]) -> None:
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)


def f(value: Any) -> float | None:
    if value in ("", None):
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def truthy(value: Any) -> bool:
    return str(value).strip().lower() == "true"


def metric_row(
    base: dict[str, Any],
    metric_name: str,
    metric_value: Any,
    label: str,
    insight: str,
    **extra: Any,
) -> dict[str, Any]:
    row = dict(base)
    row.update(
        {
            "metric_name": metric_name,
            "metric_value": round(metric_value, 4) if isinstance(metric_value, float) else metric_value,
            "interpretation_label": label,
            "insight_text": insight,
        }
    )
    row.update(extra)
    return row


def is_action(row: dict[str, str]) -> bool:
    return row.get("is_blank_event") != "true" and bool(row.get("team_id"))


def is_pass(row: dict[str, str]) -> bool:
    return row.get("coord_source") == "pass_loc" or row.get("passer_id") != ""


def is_completed(row: dict[str, str]) -> bool:
    return truthy(row.get("raw_completed")) or row.get("outcome") == "completed_pass"


def is_shot(row: dict[str, str]) -> bool:
    return row.get("shooter_id") != "" or row.get("shot_outcome") != "" or row.get("coord_source") == "shot_loc"


def is_shot_on_target(row: dict[str, str]) -> bool:
    return row.get("shot_outcome") in {"goal", "save"}


def is_final_third(row: dict[str, str]) -> bool:
    return (f(row.get("x_oriented")) or -999) > FINAL_THIRD_X


def is_box(row: dict[str, str]) -> bool:
    return truthy(row.get("is_box"))


def end_in_final_third(row: dict[str, str]) -> bool:
    return (f(row.get("end_x_oriented")) or -999) > FINAL_THIRD_X


def vertical_gain(row: dict[str, str]) -> float:
    x = f(row.get("x_oriented"))
    end_x = f(row.get("end_x_oriented"))
    if x is None or end_x is None:
        return 0.0
    return max(0.0, end_x - x)


def is_progressive(row: dict[str, str]) -> bool:
    return vertical_gain(row) >= 10.0


def is_recovery(row: dict[str, str]) -> bool:
    labels = {
        row.get("start_type", ""),
        row.get("turnover_type", ""),
        row.get("outcome", ""),
        row.get("raw_interception_type", ""),
    }
    return bool(labels & {"recovery", "interception", "tackle", "shot_recovered", "anticipated", "reacted", "passive"})


def is_loss(row: dict[str, str]) -> bool:
    return truthy(row.get("is_turnover")) or row.get("outcome") in {"turnover", "ball_lost", "lost_ball"}


def threat_weight(row: dict[str, str]) -> float:
    x = f(row.get("x_oriented"))
    y = abs(f(row.get("y_oriented")) or 99.0)
    if x is None:
        return 0.0
    if x >= BOX_X and y <= 20.16:
        return 0.18
    if x > FINAL_THIRD_X:
        return 0.08
    if x >= -FINAL_THIRD_X:
        return 0.03
    return 0.01


def threat_value(row: dict[str, str]) -> float:
    xg = f(row.get("xg"))
    if is_shot(row) and xg is not None:
        return xg
    start = threat_weight(row)
    end_x = f(row.get("end_x_oriented"))
    end_y = f(row.get("end_y_oriented"))
    if end_x is None or end_y is None:
        return 0.0
    pseudo = {
        "x_oriented": str(end_x),
        "y_oriented": str(end_y),
    }
    return max(0.0, threat_weight(pseudo) - start)


def label_share(value: float) -> str:
    if value >= 0.6:
        return "dominant"
    if value >= 0.53:
        return "edge"
    if value <= 0.4:
        return "limited"
    return "balanced"


def label_rate(value: float, high: float, low: float = 0.0) -> str:
    if value >= high:
        return "high"
    if value <= low:
        return "low"
    return "moderate"


def team_base(team: str, opponent: str, match_id: str, period: str = "", minute_bin: str = "", zone: str = "", channel: str = "") -> dict[str, Any]:
    return {
        "match_id": match_id,
        "team": team,
        "opponent": opponent,
        "period": period,
        "minute_bin": minute_bin,
        "zone": zone,
        "channel": channel,
    }


def team_names(events: list[dict[str, str]]) -> list[str]:
    return sorted({row["team_name"] for row in events if row.get("team_name")})


def opponent_of(team: str, teams: list[str]) -> str:
    return next((other for other in teams if other != team), "")


def aggregate(events: list[dict[str, str]], group_keys: list[str]) -> dict[tuple[str, ...], dict[str, Any]]:
    grouped: dict[tuple[str, ...], dict[str, Any]] = defaultdict(lambda: defaultdict(float))
    poss: dict[tuple[str, ...], set[str]] = defaultdict(set)
    for row in events:
        key = tuple(row.get(k, "") for k in group_keys)
        g = grouped[key]
        g["total_actions"] += 1
        g["attacking_third_actions"] += int(is_final_third(row))
        g["box_entries"] += int(is_box(row) or ((f(row.get("end_x_oriented")) or -999) >= BOX_X and abs(f(row.get("end_y_oriented")) or 99) <= 20.16))
        g["final_third_entries"] += int((f(row.get("x_oriented")) or -999) <= FINAL_THIRD_X and end_in_final_third(row))
        g["progressive_passes"] += int(is_pass(row) and is_completed(row) and is_progressive(row))
        g["progressive_carries"] += int(row.get("coord_source") == "run_start_loc" and is_progressive(row))
        g["vertical_distance_gained"] += vertical_gain(row)
        g["final_third_passes"] += int(is_pass(row) and end_in_final_third(row))
        g["completed_final_third_entries"] += int(is_completed(row) and ((f(row.get("x_oriented")) or -999) <= FINAL_THIRD_X and end_in_final_third(row)))
        g["shots"] += int(is_shot(row))
        g["shots_on_target"] += int(is_shot_on_target(row))
        g["shots_from_box"] += int(is_shot(row) and is_box(row))
        g["key_passes"] += int((f(row.get("raw_xg_created")) or 0) > 0 or truthy(row.get("raw_led_to_shot")))
        g["danger_entries"] += int(is_box(row) or (end_in_final_third(row) and vertical_gain(row) >= 10))
        g["threat"] += threat_value(row)
        g["recoveries"] += int(is_recovery(row))
        g["interceptions"] += int(row.get("outcome") == "interception" or row.get("start_type") == "interception" or row.get("turnover_type") == "interception")
        g["tackles"] += int(row.get("start_type") == "tackle" or row.get("turnover_type") == "tackle" or row.get("raw_tackle_id") != "")
        g["high_recoveries"] += int(is_recovery(row) and is_final_third(row))
        g["dangerous_losses"] += int(is_loss(row) and row.get("channel") == "central_channel" and (f(row.get("x_oriented")) or 0) < FINAL_THIRD_X)
        g["fast_attacks"] += int(row.get("phase_type") == "counter_attack" or ((f(row.get("raw_directness")) or 0) >= 0.6 and vertical_gain(row) >= 25))
        if f(row.get("x_oriented")) is not None:
            g["action_height_sum"] += f(row.get("x_oriented")) or 0
            g["action_height_count"] += 1
        if row.get("raw_directness"):
            g["directness_sum"] += f(row.get("raw_directness")) or 0
            g["directness_count"] += 1
        if row.get("poss_id"):
            poss[key].add(row["poss_id"])
    for key, g in grouped.items():
        g["average_action_height"] = g["action_height_sum"] / g["action_height_count"] if g["action_height_count"] else 0
        g["directness_index"] = g["directness_sum"] / g["directness_count"] if g["directness_count"] else 0
        g["possession_sequences"] = len(poss[key])
        g["avg_sequence_length"] = g["total_actions"] / len(poss[key]) if poss[key] else 0
        g["threat_per_possession"] = g["threat"] / len(poss[key]) if poss[key] else 0
        g["threat_per_attacking_action"] = g["threat"] / g["attacking_third_actions"] if g["attacking_third_actions"] else 0
    return grouped


def transitions(events: list[dict[str, str]]) -> dict[str, Counter[str]]:
    ordered = sorted((row for row in events if f(row.get("match_second")) is not None), key=lambda row: f(row.get("match_second")) or 0)
    result: dict[str, Counter[str]] = defaultdict(Counter)
    for i, row in enumerate(ordered):
        team = row.get("team_name", "")
        if not team:
            continue
        current_time = f(row.get("match_second")) or 0
        window = [n for n in ordered[i + 1 : i + 40] if (f(n.get("match_second")) or 99999) - current_time <= SHOT_WINDOW]
        if is_recovery(row):
            result[team]["recoveries_followed_by_final_third_entry"] += int(any(n.get("team_name") == team and end_in_final_third(n) for n in window if (f(n.get("match_second")) or 0) - current_time <= TRANSITION_WINDOW))
            result[team]["recoveries_followed_by_shot"] += int(any(n.get("team_name") == team and is_shot(n) for n in window))
        if is_loss(row):
            result[team]["losses_punished_by_opponent_shot_or_box_entry"] += int(any(n.get("team_name") != team and (is_shot(n) or is_box(n)) for n in window if n.get("team_name")))
    return result


def add_relative_metrics(rows: list[dict[str, Any]], metric: str, scope_keys: list[str]) -> None:
    by_scope: dict[tuple[Any, ...], list[dict[str, Any]]] = defaultdict(list)
    for row in rows:
        if row["metric_name"] == metric:
            by_scope[tuple(row.get(key, "") for key in scope_keys)].append(row)
    for group in by_scope.values():
        total = sum(float(row["metric_value"] or 0) for row in group)
        for row in group:
            share = float(row["metric_value"] or 0) / total if total else 0
            row["interpretation_label"] = label_share(share)


def append_share_metric(
    target_rows: list[dict[str, Any]],
    source_rows: list[dict[str, Any]],
    source_metric: str,
    new_metric: str,
    scope_keys: list[str],
    insight_template: str,
) -> None:
    groups: dict[tuple[Any, ...], list[dict[str, Any]]] = defaultdict(list)
    for row in source_rows:
        if row["metric_name"] == source_metric:
            groups[tuple(row.get(key, "") for key in scope_keys)].append(row)
    for group in groups.values():
        total = sum(float(row["metric_value"] or 0) for row in group)
        for row in group:
            value = float(row["metric_value"] or 0) / total if total else 0
            base = {
                key: row.get(key, "")
                for key in ["match_id", "team", "opponent", "period", "minute_bin", "zone", "channel"]
            }
            target_rows.append(
                metric_row(
                    base,
                    new_metric,
                    value,
                    label_share(value),
                    insight_template.format(team=row["team"], value=round(value * 100, 1)),
                )
            )


def build_outputs() -> None:
    games = read_csv(GAMES_FILE)[0]
    events = [row for row in read_csv(EVENTS_FILE) if is_action(row)]
    match_id = games["match_id"]
    teams = team_names(events)
    overall = aggregate(events, ["team_name"])
    by_period = aggregate(events, ["team_name", "period"])
    by_zone = aggregate(events, ["team_name", "third", "channel"])
    by_bin = aggregate(events, ["team_name", "minute_bin_5"])
    transition_counts = transitions(events)

    summary_rows: list[dict[str, Any]] = []
    period_rows: list[dict[str, Any]] = []
    zone_rows: list[dict[str, Any]] = []
    timeline_rows: list[dict[str, Any]] = []
    flags: list[dict[str, Any]] = []

    metrics = [
        "total_actions",
        "attacking_third_actions",
        "final_third_entries",
        "box_entries",
        "average_action_height",
        "progressive_passes",
        "progressive_carries",
        "vertical_distance_gained",
        "final_third_passes",
        "completed_final_third_entries",
        "directness_index",
        "avg_sequence_length",
        "shots",
        "shots_on_target",
        "shots_from_box",
        "key_passes",
        "danger_entries",
        "threat",
        "threat_per_possession",
        "threat_per_attacking_action",
        "recoveries",
        "interceptions",
        "tackles",
        "high_recoveries",
        "dangerous_losses",
        "fast_attacks",
    ]
    for team in teams:
        opponent = opponent_of(team, teams)
        data = overall[(team,)]
        base = team_base(team, opponent, match_id)
        for metric in metrics:
            value = data.get(metric, 0)
            insight = f"{team} recorded {round(value, 2)} for {metric.replace('_', ' ')}."
            summary_rows.append(metric_row(base, metric, value, "", insight))
        for metric, value in transition_counts[team].items():
            summary_rows.append(metric_row(base, metric, value, label_rate(value, 3), f"{team} had {value} transition moments for {metric.replace('_', ' ')}."))

    for (team, period), data in by_period.items():
        opponent = opponent_of(team, teams)
        base = team_base(team, opponent, match_id, period=period)
        for metric in metrics:
            value = data.get(metric, 0)
            period_rows.append(metric_row(base, metric, value, "", f"{team} period {period}: {metric.replace('_', ' ')} = {round(value, 2)}."))

    for (team, third, channel), data in by_zone.items():
        opponent = opponent_of(team, teams)
        base = team_base(team, opponent, match_id, zone=third, channel=channel)
        for metric in ["total_actions", "progressive_passes", "final_third_entries", "box_entries", "dangerous_losses", "recoveries", "threat"]:
            value = data.get(metric, 0)
            zone_rows.append(metric_row(base, metric, value, label_rate(value, 10), f"{team} generated {round(value, 2)} {metric.replace('_', ' ')} in {third}/{channel}."))

    for (team, minute_bin), data in by_bin.items():
        opponent = opponent_of(team, teams)
        base = team_base(team, opponent, match_id, minute_bin=minute_bin)
        for metric in ["attacking_third_actions", "box_entries", "shots", "danger_entries", "threat", "final_third_entries"]:
            value = data.get(metric, 0)
            timeline_rows.append(metric_row(base, metric, value, label_rate(value, 3), f"{team} produced {round(value, 2)} {metric.replace('_', ' ')} in minute bin {minute_bin}."))

    add_relative_metrics(summary_rows, "total_actions", ["match_id"])
    add_relative_metrics(summary_rows, "attacking_third_actions", ["match_id"])
    add_relative_metrics(summary_rows, "threat", ["match_id"])
    add_relative_metrics(period_rows, "attacking_third_actions", ["match_id", "period"])
    add_relative_metrics(timeline_rows, "threat", ["match_id", "minute_bin"])
    append_share_metric(
        summary_rows,
        summary_rows,
        "total_actions",
        "possession_proxy",
        ["match_id"],
        "{team} held a {value}% action-share possession proxy across the match.",
    )
    append_share_metric(
        summary_rows,
        summary_rows,
        "attacking_third_actions",
        "field_tilt",
        ["match_id"],
        "{team} owned {value}% of attacking-third actions, a territory proxy for field tilt.",
    )
    append_share_metric(
        period_rows,
        period_rows,
        "total_actions",
        "possession_proxy",
        ["match_id", "period"],
        "{team} held a {value}% action-share possession proxy in this period.",
    )
    append_share_metric(
        period_rows,
        period_rows,
        "attacking_third_actions",
        "field_tilt",
        ["match_id", "period"],
        "{team} owned {value}% of attacking-third actions in this period.",
    )
    append_share_metric(
        timeline_rows,
        timeline_rows,
        "attacking_third_actions",
        "field_tilt",
        ["match_id", "minute_bin"],
        "{team} owned {value}% of attacking-third actions in this five-minute window.",
    )

    # Automated insight flags from relative within-match thresholds.
    for team in teams:
        opponent = opponent_of(team, teams)
        data = overall[(team,)]
        opp = overall[(opponent,)]
        final_entries = data.get("final_third_entries", 0)
        box_entries = data.get("box_entries", 0)
        if final_entries >= 1 and box_entries / final_entries < 0.35:
            flags.append({
                "match_id": match_id,
                "team": team,
                "opponent": opponent,
                "period": "",
                "minute_bin": "",
                "insight_type": "territory_without_penetration",
                "severity": "medium",
                "metric_name": "box_entries_per_final_third_entry",
                "metric_value": round(box_entries / final_entries, 4),
                "interpretation_label": "limited penetration",
                "insight_text": f"{team} reached the final third {int(final_entries)} times but converted only {int(box_entries)} into box entries.",
            })
        if data.get("total_actions", 0) < opp.get("total_actions", 0) and data.get("threat_per_attacking_action", 0) > opp.get("threat_per_attacking_action", 0):
            flags.append({
                "match_id": match_id,
                "team": team,
                "opponent": opponent,
                "period": "",
                "minute_bin": "",
                "insight_type": "efficient_threat",
                "severity": "high",
                "metric_name": "threat_per_attacking_action",
                "metric_value": round(data.get("threat_per_attacking_action", 0), 4),
                "interpretation_label": "efficient",
                "insight_text": f"{team} had fewer total actions than {opponent} but generated more threat per attacking-third action.",
            })
        zone_counts = Counter()
        for (z_team, _third, channel), z_data in by_zone.items():
            if z_team == team:
                zone_counts[channel] += z_data.get("progressive_passes", 0)
        total_prog = sum(zone_counts.values())
        if total_prog:
            channel, value = zone_counts.most_common(1)[0]
            if value / total_prog >= 0.5:
                flags.append({
                    "match_id": match_id,
                    "team": team,
                    "opponent": opponent,
                    "period": "",
                    "minute_bin": "",
                    "insight_type": "channel_preference",
                    "severity": "medium",
                    "metric_name": "progressive_pass_channel_share",
                    "metric_value": round(value / total_prog, 4),
                    "interpretation_label": "clear build-up preference",
                    "insight_text": f"Most of {team}'s progressive passing came through the {channel.replace('_', ' ')}, suggesting a clear build-up preference.",
                })
        central_losses = sum(z_data.get("dangerous_losses", 0) for (z_team, _third, channel), z_data in by_zone.items() if z_team == team and channel == "central_channel")
        if central_losses >= 3:
            flags.append({
                "match_id": match_id,
                "team": team,
                "opponent": opponent,
                "period": "",
                "minute_bin": "",
                "insight_type": "central_dangerous_losses",
                "severity": "high",
                "metric_name": "central_dangerous_losses",
                "metric_value": central_losses,
                "interpretation_label": "central risk",
                "insight_text": f"{team}'s dangerous losses were concentrated in the central corridor.",
            })
        team_tilt_total = data.get("attacking_third_actions", 0) + opp.get("attacking_third_actions", 0)
        team_field_tilt = data.get("attacking_third_actions", 0) / team_tilt_total if team_tilt_total else 0
        threat_total = data.get("threat", 0) + opp.get("threat", 0)
        threat_share = data.get("threat", 0) / threat_total if threat_total else 0
        if team_field_tilt >= 0.55 and 0.45 <= threat_share <= 0.55:
            flags.append({
                "match_id": match_id,
                "team": team,
                "opponent": opponent,
                "period": "",
                "minute_bin": "",
                "insight_type": "territory_without_threat_gap",
                "severity": "medium",
                "metric_name": "field_tilt_vs_threat_share",
                "metric_value": round(team_field_tilt, 4),
                "interpretation_label": "territorial edge, level threat",
                "insight_text": f"{team} had the territorial edge but did not separate from {opponent} in total threat.",
            })
        if data.get("box_entries", 0) < opp.get("box_entries", 0) and data.get("threat_per_attacking_action", 0) > opp.get("threat_per_attacking_action", 0) * 1.15:
            flags.append({
                "match_id": match_id,
                "team": team,
                "opponent": opponent,
                "period": "",
                "minute_bin": "",
                "insight_type": "efficient_lower_volume_attack",
                "severity": "high",
                "metric_name": "threat_per_attacking_action",
                "metric_value": round(data.get("threat_per_attacking_action", 0), 4),
                "interpretation_label": "efficient threat",
                "insight_text": f"{team} produced less box volume than {opponent} but generated more threat per attacking-third action.",
            })
    for (team, period), data in by_period.items():
        opponent = opponent_of(team, teams)
        opp_period = by_period.get((opponent, period), {})
        total_tilt = data.get("attacking_third_actions", 0) + opp_period.get("attacking_third_actions", 0)
        period_tilt = data.get("attacking_third_actions", 0) / total_tilt if total_tilt else 0
        if period_tilt >= 0.55:
            flags.append({
                "match_id": match_id,
                "team": team,
                "opponent": opponent,
                "period": period,
                "minute_bin": "",
                "insight_type": "period_territorial_edge",
                "severity": "medium",
                "metric_name": "period_field_tilt",
                "metric_value": round(period_tilt, 4),
                "interpretation_label": "territorial edge",
                "insight_text": f"{team} controlled attacking-third territory in period {period}, with {round(period_tilt * 100, 1)}% of attacking-third actions.",
            })

    common_fields = ["match_id", "team", "opponent", "period", "minute_bin", "zone", "channel", "metric_name", "metric_value", "interpretation_label", "insight_text"]
    write_csv(OUTPUTS / "tableau_match_summary.csv", common_fields, summary_rows)
    write_csv(OUTPUTS / "tableau_team_period_metrics.csv", common_fields, period_rows)
    write_csv(OUTPUTS / "tableau_team_zone_metrics.csv", common_fields, zone_rows)
    write_csv(OUTPUTS / "tableau_momentum_timeline.csv", common_fields, timeline_rows)
    flag_fields = ["match_id", "team", "opponent", "period", "minute_bin", "insight_type", "severity", "metric_name", "metric_value", "interpretation_label", "insight_text"]
    write_csv(OUTPUTS / "tableau_insight_flags.csv", flag_fields, flags)
    write_metric_definitions()


def write_metric_definitions() -> None:
    text = """# Metric Definitions - Team Match Metrics

## Control and Territory
- **Total actions**: count of non-blank team events. Useful as a possession proxy, but not a true possession percentage because eventing is not a complete touch log.
- **Possession proxy / action share**: team share of total actions within a match, period or time bin. Best visualized as a KPI or stacked bar.
- **Field tilt**: team share of attacking-third actions. Indicates territorial control near the opponent goal.
- **Final-third entries**: actions moving from outside to inside the attacking third using oriented start/end coordinates.
- **Box entries**: actions or end locations inside the approximated penalty area.
- **Average action height**: mean `x_oriented`. Higher values indicate actions occurring closer to the opponent goal.

## Progression
- **Progressive passes**: completed passes gaining at least 10 meters toward goal.
- **Progressive carries**: run/carry-like events gaining at least 10 meters toward goal.
- **Vertical distance gained**: sum of positive `end_x_oriented - x_oriented`.
- **Final-third passes**: passes ending in the attacking third.
- **Directness index**: average provider `raw_directness` where available.
- **Average sequence length**: team actions per possession ID. Useful for direct vs elaborate tendencies.

## Chance Creation
- **Shots / shots on target / shots from box**: derived from shooter and shot outcome fields.
- **Key passes**: passes with `raw_xg_created > 0` or `raw_led_to_shot=true`; provider linkage is sparse, so treat as conservative.
- **Danger entries**: box entries plus high-value final-third entries.
- **Simplified threat**: shot xG when available, otherwise positive movement between zone weights. This is not official xT.
- **Threat per possession / attacking action**: efficiency measures that compare output to opportunity volume.

## Defence and Transitions
- **Recoveries/interceptions/tackles**: transparent event-label approximations using `start_type`, `turnover_type`, `outcome`, and tackle IDs.
- **High recoveries**: recoveries occurring in the attacking third after orientation.
- **Dangerous losses**: turnovers or ball losses in central/non-advanced zones.
- **Transition follow-ups**: recoveries/losses followed by final-third entries, box entries or shots within 10-15 seconds.

## Tableau Recommendations
- Match overview: KPI cards for field tilt, threat, shots, box entries and insight flags.
- Period view: grouped bars by period for territory, progression and danger.
- Zone view: pitch heatmap by `zone` and `channel`.
- Momentum view: 5-minute line chart for threat and attacking-third actions.
- Insight flags: text table or annotation panel filtered by severity.
"""
    (DOCS / "metric_definitions.md").write_text(text, encoding="utf-8")


if __name__ == "__main__":
    build_outputs()
