import Image from "next/image";
import clsx from "clsx";
import { getFallbackPlayerImage, getPlayerImage, getPlayerInitials, getTeamColor } from "@/lib/assets/assets";

export function PlayerAvatar({
  playerId,
  playerName,
  team,
  size = 48,
  className,
}: {
  playerId?: string | number | null;
  playerName: string;
  team?: string | null;
  size?: number;
  className?: string;
}) {
  const src = getPlayerImage(playerId, playerName);
  const isFallback = src === getFallbackPlayerImage();
  const initials = getPlayerInitials(playerName);
  const teamColor = getTeamColor(team);

  return (
    <div
      className={clsx("relative shrink-0 overflow-hidden rounded-full border bg-slate-900", className)}
      style={{
        width: size,
        height: size,
        borderColor: `${teamColor}66`,
      }}
    >
      <Image
        src={src}
        alt={isFallback ? `${playerName} fallback avatar` : `${playerName} headshot`}
        fill
        sizes={`${size}px`}
        className="object-cover"
      />
      {isFallback ? (
        <div className="absolute inset-0 grid place-items-center bg-black/5 text-sm font-bold text-slate-100">
          {initials}
        </div>
      ) : null}
    </div>
  );
}
