// Core domain types, mirroring the Supabase schema (supabase/schema.sql).

export type MatchStage = "league" | "knockout_m1" | "knockout_m2" | "knockout_m3" | "final";
export type MatchStatus = "upcoming" | "live" | "completed";
export type TournamentStatus = "draft" | "active" | "completed";
export type CategoryName = "Boys" | "Girls";

export interface Tournament {
  id: string;
  name: string;
  season: string;
  status: TournamentStatus;
  created_by: string;
  created_at: string;
}

export interface Category {
  id: string;
  tournament_id: string;
  name: CategoryName;
}

export interface Member {
  id: string;
  tournament_id: string;
  name: string;
  phone: string | null;
}

export interface Team {
  id: string;
  category_id: string;
  member_a_id: string;
  member_b_id: string;
  display_name: string;
}

export interface Match {
  id: string;
  category_id: string;
  stage: MatchStage;
  match_no: number;
  team_a_id: string | null;
  team_b_id: string | null;
  score_a: number | null;
  score_b: number | null;
  status: MatchStatus;
  started_at: string | null;
  completed_at: string | null;
}

export interface StandingsRow {
  team_id: string;
  team_name: string;
  played: number;
  won: number;
  tied: number;
  lost: number;
  points: number;
  rank: number;
}
