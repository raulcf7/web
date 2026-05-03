export function formatMinute(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const minute = Number(value);
  return Number.isFinite(minute) ? `${Math.floor(minute)}'` : String(value);
}

export function formatTeamName(team: string | null | undefined) {
  if (!team) {
    return "-";
  }

  if (team === "FCM") {
    return "FC Midtjylland";
  }

  if (team === "FCK") {
    return "FC København";
  }

  return team;
}

export function formatMetricLabel(metricName: string | null | undefined) {
  if (!metricName) {
    return "-";
  }

  const protectedLabels: Record<string, string> = {
    xg: "xG",
    threat_value: "Simplified threat",
    possession_proxy: "Possession proxy",
    field_tilt: "Field tilt",
    box_entries: "Box entries",
    dangerous_losses: "Dangerous losses",
    final_third_entries: "Final-third entries",
  };

  if (protectedLabels[metricName]) {
    return protectedLabels[metricName];
  }

  return metricName
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatPeriod(period: number | string | null | undefined) {
  if (period === null || period === undefined || period === "") {
    return "Full match";
  }

  const value = Number(period);

  if (value === 1) {
    return "First half";
  }

  if (value === 2) {
    return "Second half";
  }

  return `Period ${period}`;
}
