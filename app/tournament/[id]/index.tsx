import { useState, useMemo } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, radius, categoryColor } from "../../../constants/theme";
import { useCategories, useTeams, useMatches } from "../../../lib/hooks";
import { MatchCard } from "../../../components/MatchCard";
import { CategoryName, Match } from "../../../lib/types";

type SubTab = "live" | "upcoming" | "past";

export default function MatchesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [category, setCategory] = useState<CategoryName>("Girls");
  const [subTab, setSubTab] = useState<SubTab>("live");

  const { data: categories } = useCategories(id);
  const activeCategory = categories?.find((c) => c.name === category);

  const { data: teams } = useTeams(activeCategory?.id ?? "");
  const { data: matches, isLoading } = useMatches(activeCategory?.id ?? "");

  const teamName = (teamId: string | null) => teams?.find((t) => t.id === teamId)?.display_name ?? "TBD";

  const leagueMatches = useMemo(() => (matches ?? []).filter((m) => m.stage === "league"), [matches]);

  const filtered = useMemo(() => {
    if (subTab === "live") return leagueMatches.filter((m) => m.status === "live");
    if (subTab === "upcoming") return leagueMatches.filter((m) => m.status === "upcoming");
    return leagueMatches.filter((m) => m.status === "completed");
  }, [leagueMatches, subTab]);

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

      <View style={styles.subTabs}>
        {(["live", "upcoming", "past"] as SubTab[]).map((t) => (
          <Pressable key={t} onPress={() => setSubTab(t)} style={[styles.subTabBtn, subTab === t && styles.subTabBtnActive]}>
            <Text style={[styles.subTabText, subTab === t && styles.subTabTextActive]}>{t[0].toUpperCase() + t.slice(1)}</Text>
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.courtBlue} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: spacing.lg }}
          renderItem={({ item }: { item: Match }) => (
            <MatchCard match={item} teamAName={teamName(item.team_a_id)} teamBName={teamName(item.team_b_id)} />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No {subTab} matches right now.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  categoryToggle: { flexDirection: "row", gap: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  catBtn: { flex: 1, paddingVertical: spacing.sm, borderRadius: 999, borderWidth: 2, borderColor: colors.lineStrong, alignItems: "center" },
  catBtnText: { fontWeight: "700", color: colors.inkSoft },
  catBtnTextActive: { color: "#fff" },
  subTabs: { flexDirection: "row", gap: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  subTabBtn: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.sm, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  subTabBtnActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  subTabText: { fontSize: 13, fontWeight: "600", color: colors.inkSoft },
  subTabTextActive: { color: "#fff" },
  empty: { padding: spacing.xl, alignItems: "center" },
  emptyText: { color: colors.inkSoft },
});
