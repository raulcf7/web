export const colors = {
  fcm: "#8A111D",
  fcmSoft: "#C73642",
  fck: "#4D8FEA",
  background: "#07080B",
  backgroundElevated: "#0D0F14",
  surface: "#12151C",
  surfaceMuted: "#181C25",
  border: "#2A303C",
  textPrimary: "#F8FAFC",
  textSecondary: "#A7AFBD",
  textMuted: "#737D8D",
  gold: "#D8AE57",
  success: "#4ADE80",
  warning: "#FBBF24",
  danger: "#F87171",
} as const;

export const chartColors = {
  fcm: colors.fcmSoft,
  fck: colors.fck,
  neutral: "#94A3B8",
  positive: colors.success,
  warning: colors.warning,
  danger: colors.danger,
  gold: colors.gold,
  sequence: ["#C73642", "#4D8FEA", "#D8AE57", "#7DD3FC", "#A78BFA"],
} as const;

export const pitchColors = {
  grass: "#102319",
  grassAlt: "#132B1F",
  line: "rgba(255,255,255,0.42)",
  zone: "rgba(199,54,66,0.18)",
  zoneStrong: "rgba(199,54,66,0.34)",
  fcm: colors.fcmSoft,
  fck: colors.fck,
} as const;

export const theme = {
  colors,
  chartColors,
  pitchColors,
} as const;
