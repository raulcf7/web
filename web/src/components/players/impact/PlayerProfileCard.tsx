import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { StatBadge } from "@/components/ui/StatBadge";
import { TeamIdentity } from "@/components/ui/TeamIdentity";
import type { PlayerLookupRow, PlayerProfileRow } from "@/types/data";
import { getPlayerIdentity } from "@/components/players/impact/playerImpactUtils";

export function PlayerProfileCard({
  profile,
  lookup,
}: {
  profile: PlayerProfileRow | null;
  lookup: PlayerLookupRow[];
}) {
  if (!profile) {
    return (
      <article className="dashboard-card p-5">
        <p className="text-sm text-slate-400">Select a player to view profile notes.</p>
      </article>
    );
  }

  const identity = getPlayerIdentity(profile.player_id, profile.team, profile.player_name, lookup);

  return (
    <article className="dashboard-card p-5">
      <div className="flex items-start gap-4">
        <PlayerAvatar playerId={identity.playerId} playerName={identity.playerName} team={identity.team} size={74} />
        <div className="min-w-0">
          <p className="text-xl font-semibold text-white">{identity.playerName}</p>
          <p className="mt-1 text-sm text-slate-400">#{identity.shirtNumber ?? "-"} · {identity.position ?? "position n/a"}</p>
          <div className="mt-3">
            <TeamIdentity team={identity.team} crestSize={34} />
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <StatBadge tone="fcm">{profile.primary_profile ?? "Profile n/a"}</StatBadge>
        {profile.secondary_profile ? <StatBadge tone="gold">{profile.secondary_profile}</StatBadge> : null}
      </div>

      <ProfileBlock label="Strengths" value={profile.strengths} />
      <ProfileBlock label="Risks" value={profile.risks} />
      <ProfileBlock label="Staff note" value={profile.staff_note} />

      <p className="mt-5 rounded-lg border border-amber-300/20 bg-amber-300/10 p-3 text-xs leading-5 text-amber-50">
        Profiles describe this match context, not permanent player archetypes.
      </p>
    </article>
  );
}

function ProfileBlock({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="mt-5 border-t border-white/10 pt-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{value || "No standout note."}</p>
    </div>
  );
}
