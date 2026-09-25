import { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, categoryColor } from "../../../constants/theme";
import { useCategories, useTeams, useMatches, useStandings } from "../../../lib/hooks";
import { computeBracket } from "../../../lib/standings";
import { BracketView } from "../../../components/BracketView";
import { CategoryName } from "../../../lib/types";

export default function BracketScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [category, setCategory] = useState<CategoryName>("Girls");

  const { data: categories } = useCategories(id);
  const activeCategory = categories?.find((c) => c.name === category);

  const { data: teams } = useTeams(activeCategory?.id ?? "");
  const { data: matches } = useMatches(activeCategory?.id ?? "");
  const { data: standings } = useStandings(activeCategory?.id ?? "");

  const teamName = (teamId: string | null) => teams?.find((t) => t.id === teamId)?.display_name ?? "TBD";

  const bracket = useMemo(() => {
    if (!matches || !standings) return null;
    const leagueMatches = matches.filter((m) => m.stage === "league");
    const knockout = {
      m1: matches.find((m) => m.stage === "knockout_m1"),
      m2: matches.find((m) => m.stage === "knockout_m2"),
      m3: matches.find((m) => m.stage === "knockout_m3"),
      final: matches.find((m) => m.stage === "final"),
    };
    return computeBracket(standings, leagueMatches, knockout);
  }, [matches, standings]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.categoryToggle}>
        {(["Girls", "Boys"] as CategoryName[]).map((c) => (
          <Pressable
            key={c}
            onPress={() => setCategory(c)}
            style={[styles.catBtn, category === c && { backgroundColor: categoryColor(c), borderColor: categoryColor(c) }]}
          >
            <Text style={[styles.catBtnText, category === c && styles.catBtnTextActive]}>{c}</Text>
          </Pressable>
        ))}
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}>
        {bracket && <BracketView bracket={bracket} teamName={teamName} />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  categoryToggle: { flexDirection: "row", gap: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  catBtn: { flex: 1, paddingVertical: spacing.sm, borderRadius: 999, borderWidth: 2, borderColor: colors.lineStrong, alignItems: "center" },
  catBtnText: { fontWeight: "700", color: colors.inkSoft },
  catBtnTextActive: { color: "#fff" },
});
