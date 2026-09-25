import { useState } from "react";
import { View, Text, Pressable, FlatList, StyleSheet, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { colors, spacing, radius, categoryColor } from "../../../constants/theme";
import { useCategories, useMembers, useTeams } from "../../../lib/hooks";
import { supabase } from "../../../lib/supabase";
import { CategoryName, Member } from "../../../lib/types";

export default function TeamsScreen() {
  const { tournamentId } = useLocalSearchParams<{ tournamentId: string }>();
  const [category, setCategory] = useState<CategoryName>("Girls");
  const [memberA, setMemberA] = useState<Member | null>(null);
  const [memberB, setMemberB] = useState<Member | null>(null);
  const qc = useQueryClient();

  const { data: categories } = useCategories(tournamentId);
  const activeCategory = categories?.find((c) => c.name === category);
  const { data: members } = useMembers(tournamentId);
  const { data: teams } = useTeams(activeCategory?.id ?? "");

  const pairedMemberIds = new Set((teams ?? []).flatMap((t) => [t.member_a_id, t.member_b_id]));
  const available = (members ?? []).filter((m) => !pairedMemberIds.has(m.id));

  function pick(m: Member) {
    if (memberA?.id === m.id) return setMemberA(null);
    if (memberB?.id === m.id) return setMemberB(null);
    if (!memberA) return setMemberA(m);
    if (!memberB) return setMemberB(m);
    Alert.alert("Pick just two", "Deselect one first.");
  }

  async function createTeam() {
    if (!memberA || !memberB || !activeCategory) return;
    const { error } = await supabase.from("teams").insert({
      category_id: activeCategory.id,
      member_a_id: memberA.id,
      member_b_id: memberB.id,
      display_name: `${memberA.name} & ${memberB.name}`,
    });
    if (error) {
      Alert.alert("Could not create team", error.message);
      return;
    }
    setMemberA(null);
    setMemberB(null);
    qc.invalidateQueries({ queryKey: ["teams", activeCategory.id] });
  }

  async function removeTeam(id: string) {
    const { error } = await supabase.from("teams").delete().eq("id", id);
    if (error) {
      Alert.alert("Could not remove team", "Matches already generated for this team must be handled first — regenerate the schedule after removing.");
      return;
    }
    qc.invalidateQueries({ queryKey: ["teams", activeCategory?.id] });
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

      <Text style={styles.sectionLabel}>Pick two unpaired members</Text>
      <FlatList
        horizontal
        data={available}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}
        renderItem={({ item }) => {
          const selected = memberA?.id === item.id || memberB?.id === item.id;
          return (
            <Pressable onPress={() => pick(item)} style={[styles.chip, selected && styles.chipSelected]}>
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{item.name}</Text>
            </Pressable>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>All members are already on a team.</Text>}
      />

      <Pressable style={[styles.createBtn, (!memberA || !memberB) && styles.createBtnDisabled]} onPress={createTeam} disabled={!memberA || !memberB}>
        <Text style={styles.createBtnText}>
          {memberA && memberB ? `Create "${memberA.name} & ${memberB.name}"` : "Select two members above"}
        </Text>
      </Pressable>

      <Text style={styles.sectionLabel}>Teams in {category}</Text>
      <FlatList
        data={teams}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ padding: spacing.lg, paddingTop: 0 }}
        renderItem={({ item }) => (
          <View style={styles.teamRow}>
            <Text style={styles.teamName}>{item.display_name}</Text>
            <Pressable onPress={() => removeTeam(item.id)}>
              <Text style={styles.remove}>Remove</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No teams yet.</Text>}
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
  sectionLabel: { fontSize: 13, fontWeight: "700", color: colors.inkSoft, paddingHorizontal: spacing.lg, marginTop: spacing.sm, marginBottom: spacing.sm },
  chip: { backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.line, borderRadius: 999, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  chipSelected: { backgroundColor: colors.gold, borderColor: colors.gold },
  chipText: { fontSize: 14, color: colors.ink },
  chipTextSelected: { fontWeight: "700", color: "#2b1c02" },
  createBtn: { backgroundColor: colors.courtBlue, borderRadius: radius.sm, padding: spacing.md, alignItems: "center", marginHorizontal: spacing.lg, marginTop: spacing.md },
  createBtnDisabled: { backgroundColor: colors.lineStrong },
  createBtnText: { color: "#fff", fontWeight: "700" },
  teamRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.card, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.line, padding: spacing.md, marginBottom: spacing.sm },
  teamName: { fontSize: 15, color: colors.ink, fontWeight: "500" },
  remove: { color: colors.lossInk, fontSize: 13, fontWeight: "600" },
  empty: { color: colors.inkSoft, paddingHorizontal: spacing.lg },
});
