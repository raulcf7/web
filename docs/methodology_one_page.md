# Post-Match Tableau Dashboard Methodology

## Analytical Objective

The objective of this dashboard is to provide a clear post-match analysis that helps technical staff understand how the game was controlled, where advantages were created, which moments generated danger, and which players contributed most meaningfully. The dashboard was designed around football questions rather than isolated metrics. It aims to distinguish territorial dominance from effective chance creation, and to connect team behaviours with player-level contribution profiles.

## Data Preparation

The analysis combines event data, tracking data and match context. Raw event, tracking and game files were inspected for identifiers, time structure, team/player fields, coordinate systems, missing values and feasible joins. Column names were standardized, timestamps were converted into consistent match clocks, and match-minute bins were created for timeline analysis. Spatial coordinates were normalized into a common pitch reference, with oriented coordinates used so the attacking direction is consistently shown from left to right. Clean outputs were prepared in Tableau-friendly long formats with explicit metric names, values, units, interpretation labels and dashboard sections.

## Metric Framework

Metrics were grouped into six football themes: territory, progression, chance creation, defensive behaviour, transitions and individual contribution. Team-level metrics include field tilt, final-third entries, box entries, progression by channel, dangerous losses, recovery locations and simplified threat. Possession-sequence outputs were built using available possession identifiers to describe duration, directness, progression and end outcomes. Player outputs were interpreted through contribution profiles rather than raw volume alone, combining involvement, progression, chance creation, defensive actions, risk indicators and physical outputs where tracking supported them.

Metrics were included only when they could be derived reliably from the available data. Advanced tracking metrics such as width, depth, compactness and physical load were calculated only where the tracking feed supported them. Where official concepts such as true possession, pressure intensity, PPDA or expected threat were not fully supported, the dashboard uses clearly labelled proxies rather than overstating precision.

## Dashboard Design Logic

The dashboard is structured as a coaching workflow. The overview page gives the match story in under 30 seconds through KPIs, momentum and insight flags. Territory and progression views explain how teams moved the game upfield. Chance creation separates attacking volume from real danger through shot quality, box entries and threat proxies. Defensive and transition views show where possession was won or lost and what consequences followed. Player impact views identify who influenced the match and how, using role-aware contribution profiles.

## Assumptions

Event coordinates and tracking positions were treated as pitch-meter references after normalization. Oriented coordinates are used for tactical visual consistency, not to alter the underlying event sequence. Possession analysis is based on available possession identifiers and should be read as a provider-supported possession proxy. Action-share possession is not official possession time. Simplified threat is a transparent approximation using shot xG where available and spatial progression otherwise.

## Limitations

The dataset does not support every advanced tactical concept with equal confidence. Pressure, PPDA, overloads, marking relationships and causal transition effects require richer event definitions or validated tracking models. Some player metrics are sensitive to minutes played, role and event availability. For this reason, the dashboard avoids overinterpreting unavailable variables and presents proxy metrics with clear labels, confidence notes and contextual tooltips.

## How the Dashboard Supports Technical Staff

The dashboard supports staff by turning match data into a structured review: who controlled territory, whether that control created danger, where progression was most effective, which losses exposed the team, and which players shaped the match. It is intended to guide discussion, video review and coaching questions rather than replace expert judgement. The final output prioritizes interpretable, actionable metrics that can help staff move from observation to targeted tactical follow-up.
