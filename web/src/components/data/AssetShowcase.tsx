import { LeagueIcon } from "@/components/ui/LeagueIcon";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { StatBadge } from "@/components/ui/StatBadge";
import { TeamIdentity } from "@/components/ui/TeamIdentity";

const samplePlayers = [
  { playerId: 533646, playerName: "D. Osorio", team: "FCM" },
  { playerId: 423651, playerName: "E. Chilufya", team: "FCM" },
  { playerId: 430901, playerName: "E. Olafsson", team: "FCM" },
  { playerId: 57513, playerName: "J. Lossl", team: "FCM" },
  { playerId: 120721, playerName: "K. Mbabu", team: "FCM" },
  { playerId: 609108, playerName: "O. Diao", team: "FCM" },
  { playerId: 546545, playerName: "E. Achouri", team: "FCK" },
  { playerId: 96787, playerName: "M. Elyounoussi", team: "FCK" },
  { playerId: 68640, playerName: "T. Delaney", team: "FCK" },
  { playerId: 475413, playerName: "Gabriel Pereira", team: "FCK" },
  { playerId: 535944, playerName: "R. Huescas", team: "FCK" },
  { playerId: 232398, playerName: "N. Trott", team: "FCK" },
];

export function AssetShowcase() {
  return (
    <section className="dashboard-card p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-white">Asset identity test</h3>
            <StatBadge tone="neutral">visual QA</StatBadge>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Temporary section validating league, team and player assets before the final Player Impact pages are built.
          </p>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-md border border-white/10 bg-white/[0.05]">
          <LeagueIcon size={32} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-white/10 bg-black/20 p-4">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Teams</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <TeamIdentity team="FCM" label="Home" crestSize={62} />
            <TeamIdentity team="FCK" label="Away" crestSize={62} />
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-black/20 p-4">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Player headshots</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {samplePlayers.map((player) => (
              <div key={`${player.team}-${player.playerName}`} className="flex items-center gap-3 rounded-md bg-white/[0.035] p-2">
                <PlayerAvatar {...player} size={42} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{player.playerName}</p>
                  <p className="text-xs text-slate-500">{player.team}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
