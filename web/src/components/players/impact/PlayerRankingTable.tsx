import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { StatBadge } from "@/components/ui/StatBadge";
import { getTeamColor } from "@/lib/assets/assets";
import { formatMetricValue } from "@/lib/formatters/number";
import type { PlayerLookupRow, PlayerMetricRow } from "@/types/data";
import { getPlayerIdentity } from "@/components/players/impact/playerImpactUtils";

export function PlayerRankingTable({
  rows,
  lookup,
  onPlayerSelect,
}: {
  rows: PlayerMetricRow[];
  lookup: PlayerLookupRow[];
  onPlayerSelect: (player: PlayerMetricRow) => void;
}) {
  return (
    <article className="dashboard-card overflow-hidden p-0">
      <div className="border-b border-white/10 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Player ranking</p>
        <h3 className="mt-2 text-lg font-semibold text-white">Within-team comparison</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-white/10 bg-black/20 text-xs uppercase tracking-[0.12em] text-slate-500">
            <tr>
              <th className="px-5 py-3">Player</th>
              <th className="px-5 py-3">Value</th>
              <th className="px-5 py-3">Rank</th>
              <th className="px-5 py-3">Percentile</th>
              <th className="px-5 py-3">Interpretation</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const identity = getPlayerIdentity(row.player_id, row.team, row.player_name, lookup);
              return (
                <tr key={`${row.team}-${row.player_id}-${row.metric_name}`} className="border-b border-white/10 last:border-b-0">
                  <td className="px-5 py-3">
                    <button type="button" onClick={() => onPlayerSelect(row)} className="flex min-w-0 items-center gap-3 text-left">
                      <PlayerAvatar playerId={identity.playerId} playerName={identity.playerName} team={identity.team} size={42} />
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-white">{identity.playerName}</span>
                        <span className="block text-xs text-slate-500" style={{ color: getTeamColor(identity.team) }}>
                          {identity.team} · {identity.position ?? "pos. n/a"}
                        </span>
                      </span>
                    </button>
                  </td>
                  <td className="px-5 py-3 font-mono font-semibold text-white">{formatMetricValue(row.metric_value, row.metric_unit)}</td>
                  <td className="px-5 py-3 text-slate-300">#{row.rank_within_team ?? "-"}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-white/10">
                        <span className="block h-full rounded-full bg-red-300" style={{ width: `${row.percentile_within_team ?? 0}%` }} />
                      </div>
                      <span className="font-mono text-xs text-slate-300">{formatMetricValue(row.percentile_within_team, "%")}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <StatBadge tone={row.interpretation_label === "high" ? "fcm" : "neutral"}>
                      {row.interpretation_label ?? "n/a"}
                    </StatBadge>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate-400">No players match the current filters.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </article>
  );
}
