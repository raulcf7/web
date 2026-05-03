export function formatNumber(value: number | null | undefined, options?: Intl.NumberFormatOptions) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "-";
  }

  return new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: 1,
    ...options,
  }).format(value);
}

export function formatMetricValue(value: number | null | undefined, unit?: string | null) {
  if (value === null || value === undefined) {
    return "-";
  }

  if (unit === "%" || unit === "percent") {
    return formatPercent(value);
  }

  if (unit === "xG" || unit === "threat") {
    return formatNumber(value, { maximumFractionDigits: 2 });
  }

  return formatNumber(value);
}

export function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "-";
  }

  const normalized = Math.abs(value) <= 1 ? value * 100 : value;
  return `${formatNumber(normalized, { maximumFractionDigits: 0 })}%`;
}
