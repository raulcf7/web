import { ScoreboardHeader } from "@/components/match/ScoreboardHeader";

export function MatchHeader({
  homeTeam = "FCM",
  awayTeam = "FCK",
  homeScore,
  awayScore,
  matchDate,
}: {
  homeTeam?: string | null;
  awayTeam?: string | null;
  homeScore: number | null;
  awayScore: number | null;
  matchDate?: string | null;
}) {
  return (
    <ScoreboardHeader
      homeTeam={homeTeam}
      awayTeam={awayTeam}
      homeScore={homeScore}
      awayScore={awayScore}
      matchDate={matchDate}
    />
  );
}
