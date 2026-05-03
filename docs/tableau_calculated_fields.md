# Tableau Calculated Fields

Use these formulas as implementation-ready Tableau calculated fields. Field names may need minor adjustment if Tableau aliases a column.

## Field Zones
```tableau
IF [x_oriented] >= 39.5 AND ABS([y_oriented]) <= 20.16 THEN "box"
ELSEIF [x_oriented] > 18.67 THEN "attacking_third"
ELSEIF [x_oriented] < -18.67 THEN "defensive_third"
ELSE "middle_third"
END
```

## Channels
```tableau
IF [y_oriented] < -13.33 THEN "left_channel"
ELSEIF [y_oriented] > 13.33 THEN "right_channel"
ELSE "central_channel"
END
```

## Minute Bins
```tableau
INT([match_second] / 300) * 5
```

## Metric Labels
```tableau
REPLACE(REPLACE([metric_name], "_", " "), "xg", "xG")
```

## Team Comparison Labels
```tableau
IF [metric_value] > WINDOW_AVG([metric_value]) THEN [team_name] + " above match average"
ELSEIF [metric_value] < WINDOW_AVG([metric_value]) THEN [team_name] + " below match average"
ELSE [team_name] + " level with match average"
END
```

## High / Medium / Low Thresholds
```tableau
IF [metric_value] >= WINDOW_PERCENTILE([metric_value], 0.75) THEN "high"
ELSEIF [metric_value] <= WINDOW_PERCENTILE([metric_value], 0.25) THEN "low"
ELSE "medium"
END
```

## Per 90 Metrics
```tableau
IF SUM([minutes_played]) > 0 THEN SUM([metric_value]) / SUM([minutes_played]) * 90 END
```

## Percentage Share Metrics
```tableau
SUM([metric_value]) / WINDOW_SUM(SUM([metric_value]))
```

## Momentum Index
```tableau
ZN(SUM(IF [metric_name] = "threat" THEN [metric_value] END)) * 3
+ ZN(SUM(IF [metric_name] = "box_entries" THEN [metric_value] END)) * 2
+ ZN(SUM(IF [metric_name] = "attacking_third_actions" THEN [metric_value] END))
```

## Danger Index
```tableau
ZN(SUM([xg])) * 4
+ ZN(SUM([threat_value])) * 2
+ ZN(SUM(IIF([is_from_box], 1, 0)))
+ ZN(SUM(IIF([is_on_target], 1, 0)))
```

## Direct vs Elaborate Attack
```tableau
IF [duration_seconds] <= 12 AND [vertical_gain_m] >= 25 THEN "direct transition"
ELSEIF [actions] >= 12 OR [duration_seconds] >= 35 THEN "elaborate possession"
ELSEIF [vertical_gain_m] >= 20 THEN "progressive possession"
ELSE "maintenance possession"
END
```
