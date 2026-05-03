import type { TeamCode } from "@/types/football";
import { fallbackPlayerImage, playerImageById, playerImageByNormalizedName } from "@/lib/assets/playerImageMap";
import { colors } from "@/lib/constants/theme";

const teamCrests: Record<string, string> = {
  FCM: "/assets/teams/FC_Midtjylland_8113.png",
  "FC Midtjylland": "/assets/teams/FC_Midtjylland_8113.png",
  FC_Midtjylland_8113: "/assets/teams/FC_Midtjylland_8113.png",
  "1000": "/assets/teams/FC_Midtjylland_8113.png",
  FCK: "/assets/teams/FC_København_8391.png",
  "FC København": "/assets/teams/FC_København_8391.png",
  "FC Kobenhavn": "/assets/teams/FC_København_8391.png",
  FC_København_8391: "/assets/teams/FC_København_8391.png",
  "569": "/assets/teams/FC_København_8391.png",
};

export function getLeagueIcon() {
  return "/assets/league/den-1.png";
}

export function getTeamCrest(team?: string | number | null) {
  if (team === undefined || team === null) {
    return undefined;
  }

  return teamCrests[String(team)];
}

export function getTeamColor(team?: string | number | null) {
  const teamCode = getTeamCode(team ? String(team) : null);

  if (teamCode === "FCM") {
    return colors.fcmSoft;
  }

  if (teamCode === "FCK") {
    return colors.fck;
  }

  return colors.textSecondary;
}

export function getTeamCode(team?: string | null): TeamCode | undefined {
  if (!team) {
    return undefined;
  }

  const value = normalizeName(team);

  if (value.includes("midtjylland") || value === "fcm") {
    return "FCM";
  }

  if (value.includes("kobenhavn") || value.includes("københavn") || value === "fck") {
    return "FCK";
  }

  return undefined;
}

export function getPlayerHeadshot({
  playerId,
  playerName,
}: {
  playerId?: string | number | null;
  playerName?: string | null;
  team?: string | null;
}) {
  return getPlayerImage(playerId, playerName);
}

export function getPlayerImage(playerId?: string | number | null, playerName?: string | null) {
  const id = playerId ? String(playerId) : "";
  const direct = playerImageById[id];

  if (direct) {
    return direct;
  }

  const normalized = normalizeName(playerName ?? "");
  const byName = playerImageByNormalizedName[normalized];

  if (byName) {
    return byName;
  }

  return getFallbackPlayerImage();
}

export function getFallbackPlayerImage() {
  return fallbackPlayerImage;
}

export function getPlayerInitials(name?: string | null) {
  if (!name) {
    return "NA";
  }

  const clean = name.replace(/\./g, " ").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";

  return `${first}${last}`.toUpperCase() || "NA";
}

export function normalizeAssetName(value: string) {
  return normalizeName(value);
}

function normalizeName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ø/g, "o")
    .replace(/Ø/g, "O")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();
}
