import { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { colors, spacing, radius } from "../../../../constants/theme";
import { useMatches, useTeams, useStartMatch, useSubmitScore } from "../../../../lib/hooks";
import { useCategories } from "../../../../lib/hooks";

export default function MatchDetail() {
  const { tournamentId, matchId } = useLocalSearchParams<{ tournamentId: string; matchId: string }>();
  const { data: categories } = useCategories(tournamentId);

  // matches are fetched per-category elsewhere; here we just need this one match's
  // category, so pull from any category's cached match list that contains it
  const girls = categories?.find((c) => c.name === "Girls");
  const boys = categories?.find((c) => c.name === "Boys");
  const { data: girlsMatches } = useMatches(girls?.id ?? "");
  const { data: boysMatches } = useMatches(boys?.id ?? "");
  const match = [...(girlsMatches ?? []), ...(boysMatches ?? [])].find((m) => m.id === matchId);

  const { data: teams } = useTeams(match?.category_id ?? "");
  const teamName = (id: string | null) => teams?.find((t) => t.id === id)?.display_name ?? "TBD";

  const startMatch = useStartMatch();
  const submitScore = useSubmitScore();

  const [scoreA, setScoreA] = useState("");
  const [scoreB, setScoreB] = useState("");

  useEffect(() => {
    if (match?.score_a !== null && match?.score_a !== undefined) setScoreA(String(match.score_a));
    if (match?.score_b !== null && match?.score_b !== undefined) setScoreB(String(match.score_b));
  }, [match?.id]);

  if (!match) return <View style={styles.wrap} />;

  async function handleStart() {
    await startMatch.mutateAsync(match!.id);
  }

  async function handleSubmit() {
    const a = Number(scoreA);
    const b = Number(scoreB);
    if (Number.isNaN(a) || Number.isNaN(b)) {
      Alert.alert("Enter both scores");
      return;
    }
    await submitScore.mutateAsync({ matchId: match!.id, scoreA: a, scoreB: b });
    router.back();
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.matchNo}>Match #{match.match_no}</Text>

      <View style={styles.teamRow}>
        <Text style={styles.teamName}>{teamName(match.team_a_id)}</Text>
        <TextInput style={styles.scoreInput} keyboardType="number-pad" value={scoreA} onChangeText={setScoreA} placeholder="0" placeholderTextColor={colors.inkSoft} />
      </View>
      <View style={styles.teamRow}>
        <Text style={styles.teamName}>{teamName(match.team_b_id)}</Text>
        <TextInput style={styles.scoreInput} keyboardType="number-pad" value={scoreB} onChangeText={setScoreB} placeholder="0" placeholderTextColor={colors.inkSoft} />
      </View>

      {match.status === "upcoming" && (
        <Pressable style={styles.startBtn} onPress={handleStart}>
          <Text style={styles.startBtnText}>Start Match</Text>
        </Pressable>
      )}

      {match.status !== "upcoming" && (
        <Pressable style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>{match.status === "completed" ? "Update Score" : "Complete Match"}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.cream, padding: spacing.lg },
  matchNo: { fontSize: 15, fontWeight: "700", color: colors.inkSoft, marginBottom: spacing.lg },
  teamRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, padding: spacing.md, marginBottom: spacing.md },
  teamName: { fontSize: 16, fontWeight: "500", color: colors.ink, flex: 1 },
  scoreInput: { width: 64, textAlign: "center", fontSize: 22, fontWeight: "700", borderWidth: 1.5, borderColor: colors.lineStrong, borderRadius: radius.sm, padding: spacing.sm },
  startBtn: { backgroundColor: colors.gold, borderRadius: radius.sm, padding: spacing.md, alignItems: "center", marginTop: spacing.lg },
  startBtnText: { fontWeight: "700", color: "#2b1c02" },
  submitBtn: { backgroundColor: colors.courtBlue, borderRadius: radius.sm, padding: spacing.md, alignItems: "center", marginTop: spacing.lg },
  submitBtnText: { fontWeight: "700", color: "#fff" },
});
