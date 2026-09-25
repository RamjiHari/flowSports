import { SupabaseClient } from "@supabase/supabase-js";
import { generateRoundRobinSchedule } from "./schedule";
import { Match, Team } from "./types";

/**
 * (Re)generates the League stage for a category.
 *
 * Safe to call again after a team is added mid-tournament: any league
 * match between two teams that has already been completed is kept
 * as-is (same behavior as the spreadsheet workflow when Varun & Steve
 * were added to Boys mid-tournament). Only new pairings get fresh,
 * unplayed match rows. Match numbers are reassigned to the new
 * balanced order.
 */
export async function regenerateLeagueSchedule(supabase: SupabaseClient, categoryId: string) {
  const { data: teams, error: teamsError } = await supabase
    .from("teams")
    .select("*")
    .eq("category_id", categoryId);
  if (teamsError) throw teamsError;
  if (!teams || teams.length < 2) {
    throw new Error("Need at least 2 teams before generating a schedule.");
  }

  const { data: existing, error: existingError } = await supabase
    .from("matches")
    .select("*")
    .eq("category_id", categoryId)
    .eq("stage", "league");
  if (existingError) throw existingError;

  // index existing completed matches by unordered team-pair key
  const completedByPair = new Map<string, Match>();
  for (const m of existing ?? []) {
    if (m.status === "completed" && m.team_a_id && m.team_b_id) {
      const key = [m.team_a_id, m.team_b_id].sort().join("|");
      completedByPair.set(key, m as Match);
    }
  }

  const schedule = generateRoundRobinSchedule(teams.length);
  const rows = schedule.map((s) => {
    const teamA = (teams as Team[])[s.teamAIndex];
    const teamB = (teams as Team[])[s.teamBIndex];
    const key = [teamA.id, teamB.id].sort().join("|");
    const prior = completedByPair.get(key);

    return {
      category_id: categoryId,
      stage: "league" as const,
      match_no: s.matchNo,
      team_a_id: teamA.id,
      team_b_id: teamB.id,
      score_a: prior?.score_a ?? null,
      score_b: prior?.score_b ?? null,
      status: prior?.status ?? "upcoming",
      started_at: prior?.started_at ?? null,
      completed_at: prior?.completed_at ?? null,
    };
  });

  // replace all league matches for this category in one transaction-like pass
  const { error: deleteError } = await supabase.from("matches").delete().eq("category_id", categoryId).eq("stage", "league");
  if (deleteError) throw deleteError;

  const { error: insertError } = await supabase.from("matches").insert(rows);
  if (insertError) throw insertError;

  // ensure the 4 knockout stage stubs exist (teams filled in dynamically
  // once League play completes -- see lib/standings.ts computeBracket)
  const { data: existingKnockout } = await supabase
    .from("matches")
    .select("id, stage")
    .eq("category_id", categoryId)
    .neq("stage", "league");

  const haveStages = new Set((existingKnockout ?? []).map((m) => m.stage));
  const knockoutStubs = (["knockout_m1", "knockout_m2", "knockout_m3", "final"] as const)
    .filter((stage) => !haveStages.has(stage))
    .map((stage, i) => ({
      category_id: categoryId,
      stage,
      match_no: i + 1,
      team_a_id: null,
      team_b_id: null,
      score_a: null,
      score_b: null,
      status: "upcoming" as const,
    }));

  if (knockoutStubs.length > 0) {
    const { error: stubError } = await supabase.from("matches").insert(knockoutStubs);
    if (stubError) throw stubError;
  }

  return { matchesCreated: rows.length };
}
