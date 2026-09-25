import { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, categoryColor } from "../../../constants/theme";
import { useCategories, useStandings } from "../../../lib/hooks";
import { StandingsTable } from "../../../components/StandingsTable";
import { CategoryName } from "../../../lib/types";

export default function StandingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [category, setCategory] = useState<CategoryName>("Girls");

  const { data: categories } = useCategories(id);
  const activeCategory = categories?.find((c) => c.name === category);
  const { data: standings } = useStandings(activeCategory?.id ?? "");

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
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <StandingsTable rows={standings ?? []} />
        <Text style={styles.footnote}>Top 4 (highlighted) advance to the Round 2 knockout.</Text>
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
  footnote: { fontSize: 12, color: colors.inkSoft, textAlign: "center", marginTop: spacing.md },
});
