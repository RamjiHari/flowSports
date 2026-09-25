import { Match, StandingsRow, Team } from "./types";

/**
 * Computes standings from league matches only.
 *
 * IMPORTANT: "played" counts only matches with a recorded result, not
 * every scheduled match. This is the exact bug found and fixed in this
 * org's earlier spreadsheet: counting every scheduled match as "played"
 * made every team's "lost" count wrong mid-tournament (a team with 1
 * played, 1 won would incorrectly show 6 losses out of 7 scheduled
 * matches). Standings must always reflect only completed results.
 */
export function computeStandings(teams: Team[], leagueMatches: Match[]): StandingsRow[] {
  const stats = new Map<string, StandingsRow>();
  for (const t of teams) {
    stats.set(t.id, {
      team_id: t.id,
      team_name: t.display_name,
      played: 0,
      won: 0,
      tied: 0,
      lost: 0,
      points: 0,
      rank: 0,
    });
  }

  for (const m of leagueMatches) {
    if (m.score_a === null || m.score_b === null) continue; // not played yet
    if (!m.team_a_id || !m.team_b_id) continue;
    const a = stats.get(m.team_a_id);
    const b = stats.get(m.team_b_id);
    if (!a || !b) continue;

    a.played++;
    b.played++;
    if (m.score_a > m.score_b) {
      a.won++;
      b.lost++;
      a.points += 2;
    } else if (m.score_b > m.score_a) {
      b.won++;
      a.lost++;
      b.points += 2;
    } else {
      a.tied++;
      b.tied++;
      a.points += 1;
      b.points += 1;
    }
  }

  const rows = Array.from(stats.values()).sort((x, y) => y.points - x.points);
  rows.forEach((row, i) => (row.rank = i + 1));
  return rows;
}

export interface BracketStage {
  teamAId: string | null;
  teamBId: string | null;
  winnerId: string | null;
}

export interface Bracket {
  ready: boolean; // false until every league match has a result
  m1: BracketStage & { loserId: string | null }; // Seed 1 vs Seed 2 -> winner is direct finalist
  m2: BracketStage; // Seed 3 vs Seed 4
  m3: BracketStage; // Runner (m1 loser) vs m2 winner -> winner is 2nd finalist
  final: BracketStage;
  champion: string | null;
}

function decideWinner(scoreA: number | null, scoreB: number | null, teamAId: string | null, teamBId: string | null): string | null {
  if (scoreA === null || scoreB === null || teamAId === null || teamBId === null) return null;
  if (scoreA > scoreB) return teamAId;
  if (scoreB > scoreA) return teamBId;
  return null; // a tie in a knockout match must be replayed / resolved manually
}

/**
 * Computes the Round 2 knockout bracket from standings + whatever scores
 * have been entered for the knockout matches so far. Top-4 seeding and
 * the "Match 1 winner advances directly to the Final" rule are exactly
 * as used in this org's spreadsheet and live-scoreboard build.
 */
export function computeBracket(
  standings: StandingsRow[],
  leagueMatches: Match[],
  knockoutMatches: { m1?: Match; m2?: Match; m3?: Match; final?: Match }
): Bracket {
  const leagueComplete = leagueMatches.length > 0 && leagueMatches.every((m) => m.score_a !== null && m.score_b !== null);

  if (!leagueComplete || standings.length < 4) {
    return {
      ready: false,
      m1: { teamAId: null, teamBId: null, winnerId: null, loserId: null },
      m2: { teamAId: null, teamBId: null, winnerId: null },
      m3: { teamAId: null, teamBId: null, winnerId: null },
      final: { teamAId: null, teamBId: null, winnerId: null },
      champion: null,
    };
  }

  const seeds = standings.slice(0, 4).map((r) => r.team_id);
  const [seed1, seed2, seed3, seed4] = seeds;

  const m1Winner = decideWinner(knockoutMatches.m1?.score_a ?? null, knockoutMatches.m1?.score_b ?? null, seed1, seed2);
  const m1Loser = m1Winner ? (m1Winner === seed1 ? seed2 : seed1) : null;

  const m2Winner = decideWinner(knockoutMatches.m2?.score_a ?? null, knockoutMatches.m2?.score_b ?? null, seed3, seed4);

  const m3TeamA = m1Loser;
  const m3TeamB = m2Winner;
  const m3Winner = decideWinner(knockoutMatches.m3?.score_a ?? null, knockoutMatches.m3?.score_b ?? null, m3TeamA, m3TeamB);

  const finalTeamA = m1Winner;
  const finalTeamB = m3Winner;
  const champion = decideWinner(knockoutMatches.final?.score_a ?? null, knockoutMatches.final?.score_b ?? null, finalTeamA, finalTeamB);

  return {
    ready: true,
    m1: { teamAId: seed1, teamBId: seed2, winnerId: m1Winner, loserId: m1Loser },
    m2: { teamAId: seed3, teamBId: seed4, winnerId: m2Winner },
    m3: { teamAId: m3TeamA, teamBId: m3TeamB, winnerId: m3Winner },
    final: { teamAId: finalTeamA, teamBId: finalTeamB, winnerId: champion },
    champion,
  };
}
