import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";
import { Category, Match, Member, StandingsRow, Team, Tournament } from "./types";

export function useTournaments() {
  return useQuery({
    queryKey: ["tournaments"],
    queryFn: async (): Promise<Tournament[]> => {
      const { data, error } = await supabase.from("tournaments").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCategories(tournamentId: string) {
  return useQuery({
    queryKey: ["categories", tournamentId],
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase.from("categories").select("*").eq("tournament_id", tournamentId);
      if (error) throw error;
      return data;
    },
    enabled: !!tournamentId,
  });
}

export function useTeams(categoryId: string) {
  return useQuery({
    queryKey: ["teams", categoryId],
    queryFn: async (): Promise<Team[]> => {
      const { data, error } = await supabase.from("teams").select("*").eq("category_id", categoryId);
      if (error) throw error;
      return data;
    },
    enabled: !!categoryId,
  });
}

export function useMatches(categoryId: string) {
  return useQuery({
    queryKey: ["matches", categoryId],
    queryFn: async (): Promise<Match[]> => {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .eq("category_id", categoryId)
        .order("match_no", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!categoryId,
  });
}

export function useStandings(categoryId: string) {
  return useQuery({
    queryKey: ["standings", categoryId],
    queryFn: async (): Promise<StandingsRow[]> => {
      const { data, error } = await supabase
        .from("standings")
        .select("*")
        .eq("category_id", categoryId)
        .order("rank", { ascending: true });
      if (error) throw error;
      return data as unknown as StandingsRow[];
    },
    enabled: !!categoryId,
  });
}

export function useMembers(tournamentId: string) {
  return useQuery({
    queryKey: ["members", tournamentId],
    queryFn: async (): Promise<Member[]> => {
      const { data, error } = await supabase.from("members").select("*").eq("tournament_id", tournamentId);
      if (error) throw error;
      return data;
    },
    enabled: !!tournamentId,
  });
}

export function useStartMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (matchId: string) => {
      const { error } = await supabase
        .from("matches")
        .update({ status: "live", started_at: new Date().toISOString() })
        .eq("id", matchId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["matches"] }),
  });
}

export function useSubmitScore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { matchId: string; scoreA: number; scoreB: number }) => {
      const { error } = await supabase
        .from("matches")
        .update({
          score_a: args.scoreA,
          score_b: args.scoreB,
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", args.matchId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["matches"] });
      qc.invalidateQueries({ queryKey: ["standings"] });
    },
  });
}
