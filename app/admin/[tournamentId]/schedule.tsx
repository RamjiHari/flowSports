import { useState } from "react";
import { View, Text, Pressable, FlatList, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useLocalSearchParams, Link } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { colors, spacing, radius, categoryColor } from "../../../constants/theme";
import { useCategories, useTeams, useMatches } from "../../../lib/hooks";
import { regenerateLeagueSchedule } from "../../../lib/generateSchedule";
import { supabase } from "../../../lib/supabase";
import { CategoryName } from "../../../lib/types";

export default function ScheduleScreen() {
  const { tournamentId } = useLocalSearchParams<{ tournamentId: string }>();
  const [category, setCategory] = useState<CategoryName>("Girls");
  const [generating, setGenerating] = useState(false);
  const qc = useQueryClient();

  const { data: categories } = useCategories(tournamentId);
  const activeCategory = categories?.find((c) => c.name === category);
  const { data: teams } = useTeams(activeCategory?.id ?? "");
  const { data: matches } = useMatches(activeCategory?.id ?? "");

  const teamName = (id: string | null) => teams?.find((t) => t.id === id)?.display_name ?? "TBD";
  const leagueMatches = (matches ?? []).filter((m) => m.stage === "league").sort((a, b) => a.match_no - b.match_no);

  async function generate() {
    if (!activeCategory) return;
    setGenerating(true);
    try {
      const result = await regenerateLeagueSchedule(supabase, activeCategory.id);
      qc.invalidateQueries({ queryKey: ["matches", activeCategory.id] });
      Alert.alert("Schedule generated", `${result.matchesCreated} League matches created. Already-completed results were kept.`);
    } catch (e: any) {
      Alert.alert("Could not generate schedule", e.message ?? String(e));
    } finally {
      setGenerating(false);
    }
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.categoryToggle}>
        {(["Girls", "Boys"] as CategoryName[]).map((c) => (
          <Pressable key={c} onPress={() => setCategory(c)} style={[styles.catBtn, category === c && { backgroundColor: categoryColor(c), borderColor: categoryColor(c) }]}>
            <Text style={[styles.catBtnText, category === c && styles.catBtnTextActive]}>{c}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.generateBtn} onPress={generate} disabled={generating}>
        {generating ? <ActivityIndicator color="#fff" /> : <Text style={styles.generateBtnText}>Generate / Regenerate League Schedule</Text>}
      </Pressable>
      <Text style={styles.hint}>
        Safe to re-run any time a team is added or removed — completed results are kept, only new pairings get fresh matches.
      </Text>

      <FlatList
        data={leagueMatches}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: spacing.lg }}
        renderItem={({ item }) => (
          <Link href={`/admin/${tournamentId}/match/${item.id}`} asChild>
            <Pressable style={styles.matchRow}>
              <Text style={styles.matchNo}>#{item.match_no}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.matchTeams} numberOfLines={1}>
                  {teamName(item.team_a_id)} vs {teamName(item.team_b_id)}
                </Text>
                <Text style={styles.matchStatus}>{item.status}</Text>
              </View>
              {item.status === "completed" && (
                <Text style={styles.matchScore}>
                  {item.score_a}-{item.score_b}
                </Text>
              )}
            </Pressable>
          </Link>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No schedule yet — generate one above once teams are set.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.cream },
  categoryToggle: { flexDirection: "row", gap: spacing.sm, padding: spacing.lg, paddingBottom: spacing.sm },
  catBtn: { flex: 1, paddingVertical: spacing.sm, borderRadius: 999, borderWidth: 2, borderColor: colors.lineStrong, alignItems: "center" },
  catBtnText: { fontWeight: "700", color: colors.inkSoft },
  catBtnTextActive: { color: "#fff" },
  generateBtn: { backgroundColor: colors.courtBlue, borderRadius: radius.sm, padding: spacing.md, alignItems: "center", marginHorizontal: spacing.lg },
  generateBtnText: { color: "#fff", fontWeight: "700" },
  hint: { fontSize: 12, color: colors.inkSoft, textAlign: "center", marginTop: spacing.sm, marginHorizontal: spacing.lg },
  matchRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: colors.card, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.line, padding: spacing.md, marginBottom: spacing.sm },
  matchNo: { fontSize: 13, fontWeight: "700", color: colors.inkSoft, width: 30 },
  matchTeams: { fontSize: 14, color: colors.ink, fontWeight: "500" },
  matchStatus: { fontSize: 11, color: colors.inkSoft, textTransform: "capitalize", marginTop: 2 },
  matchScore: { fontSize: 15, fontWeight: "700", color: colors.ink },
  empty: { textAlign: "center", color: colors.inkSoft, marginTop: spacing.xl },
});
