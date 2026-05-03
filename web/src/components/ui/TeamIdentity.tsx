import clsx from "clsx";
import { getTeamColor } from "@/lib/assets/assets";
import { formatTeamName } from "@/lib/formatters/football";
import { TeamCrest } from "@/components/ui/TeamCrest";

export function TeamIdentity({
  team,
  label,
  align = "left",
  crestSize = 48,
  className,
}: {
  team: string;
  label?: string;
  align?: "left" | "right";
  crestSize?: number;
  className?: string;
}) {
  const teamColor = getTeamColor(team);

  return (
    <div className={clsx("flex items-center gap-3", align === "right" && "flex-row-reverse text-right", className)}>
      <TeamCrest team={team} size={crestSize} />
      <div className="min-w-0">
        {label ? (
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
        ) : null}
        <p className="truncate text-base font-semibold text-white">{formatTeamName(team)}</p>
        <span
          className="mt-1 block h-1 w-10 rounded-full"
          style={{
            backgroundColor: teamColor,
            marginLeft: align === "right" ? "auto" : undefined,
          }}
        />
      </div>
    </div>
  );
}
