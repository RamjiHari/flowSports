import { useState } from "react";
import { View, Text, TextInput, FlatList, Pressable, StyleSheet, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { colors, spacing, radius } from "../../../constants/theme";
import { useMembers } from "../../../lib/hooks";
import { supabase } from "../../../lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

export default function MembersScreen() {
  const { tournamentId } = useLocalSearchParams<{ tournamentId: string }>();
  const { data: members } = useMembers(tournamentId);
  const [name, setName] = useState("");
  const qc = useQueryClient();

  async function addMember() {
    if (!name.trim()) return;
    const { error } = await supabase.from("members").insert({ tournament_id: tournamentId, name: name.trim() });
    if (error) {
      Alert.alert("Could not add member", error.message);
      return;
    }
    setName("");
    qc.invalidateQueries({ queryKey: ["members", tournamentId] });
  }

  async function removeMember(id: string) {
    const { error } = await supabase.from("members").delete().eq("id", id);
    if (error) {
      Alert.alert("Could not remove", "This member may already be on a team — remove them from their team first.");
      return;
    }
    qc.invalidateQueries({ queryKey: ["members", tournamentId] });
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.addRow}>
        <TextInput style={styles.input} placeholder="Member name" placeholderTextColor={colors.inkSoft} value={name} onChangeText={setName} onSubmitEditing={addMember} />
        <Pressable style={styles.addBtn} onPress={addMember}>
          <Text style={styles.addBtnText}>Add</Text>
        </Pressable>
      </View>

      <FlatList
        data={members}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: spacing.lg }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.name}>{item.name}</Text>
            <Pressable onPress={() => removeMember(item.id)}>
              <Text style={styles.remove}>Remove</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No members yet — add the first one above.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.cream },
  addRow: { flexDirection: "row", gap: spacing.sm, padding: spacing.lg, paddingBottom: 0 },
  input: { flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.sm, padding: spacing.md, fontSize: 15 },
  addBtn: { backgroundColor: colors.courtBlue, borderRadius: radius.sm, paddingHorizontal: spacing.lg, justifyContent: "center" },
  addBtnText: { color: "#fff", fontWeight: "700" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.card, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.line, padding: spacing.md, marginBottom: spacing.sm },
  name: { fontSize: 15, color: colors.ink },
  remove: { color: colors.lossInk, fontSize: 13, fontWeight: "600" },
  empty: { textAlign: "center", color: colors.inkSoft, marginTop: spacing.xl },
});
