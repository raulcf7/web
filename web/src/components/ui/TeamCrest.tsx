import Image from "next/image";
import clsx from "clsx";
import { getTeamColor, getTeamCrest } from "@/lib/assets/assets";

export function TeamCrest({
  team,
  size = 48,
  className,
}: {
  team: string;
  size?: number;
  className?: string;
}) {
  const crest = getTeamCrest(team);
  const teamColor = getTeamColor(team);

  if (!crest) {
    return (
      <div
        className={clsx("grid place-items-center rounded-full border text-xs font-bold text-white", className)}
        style={{
          width: size,
          height: size,
          borderColor: `${teamColor}66`,
          backgroundColor: `${teamColor}22`,
        }}
        aria-label={`${team} crest fallback`}
      >
        {team.slice(0, 3).toUpperCase()}
      </div>
    );
  }

  return (
    <Image
      src={crest}
      alt={`${team} crest`}
      width={size}
      height={size}
      className={clsx("object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.45)]", className)}
      priority={size >= 56}
    />
  );
}
