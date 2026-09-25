import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { colors, spacing, radius } from "../../constants/theme";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/useAuth";
import { useQueryClient } from "@tanstack/react-query";

export default function NewTournament() {
  const [name, setName] = useState("");
  const [season, setSeason] = useState(String(new Date().getFullYear()));
  const [busy, setBusy] = useState(false);
  const { session } = useAuth();
  const qc = useQueryClient();

  async function create() {
    if (!name.trim()) {
      Alert.alert("Give the tournament a name");
      return;
    }
    setBusy(true);

    const { data: existing } = await supabase.from("tournaments").select("id").eq("name", name.trim()).maybeSingle();
    if (existing) {
      setBusy(false);
      Alert.alert("That name is already taken", "Tournament names must be unique — try adding the year, e.g. \"Badminton 2026\".");
      return;
    }

    const { data: tournament, error } = await supabase
      .from("tournaments")
      .insert({ name: name.trim(), season: season.trim(), status: "draft", created_by: session?.user.id })
      .select()
      .single();

    if (error || !tournament) {
      setBusy(false);
      Alert.alert("Could not create tournament", error?.message ?? "Unknown error");
      return;
    }

    const { error: catError } = await supabase.from("categories").insert([
      { tournament_id: tournament.id, name: "Boys" },
      { tournament_id: tournament.id, name: "Girls" },
    ]);

    setBusy(false);
    if (catError) {
      Alert.alert("Tournament created, but categories failed", catError.message);
    }

    qc.invalidateQueries({ queryKey: ["tournaments"] });
    router.replace(`/admin/${tournament.id}/members`);
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Tournament name (must be unique)</Text>
      <TextInput style={styles.input} placeholder="Badminton 2026" placeholderTextColor={colors.inkSoft} value={name} onChangeText={setName} />

      <Text style={styles.label}>Season / year</Text>
      <TextInput style={styles.input} placeholder="2026" placeholderTextColor={colors.inkSoft} value={season} onChangeText={setSeason} keyboardType="number-pad" />

      <Text style={styles.hint}>Boys and Girls categories are created automatically — you'll add members and teams to each next.</Text>

      <Pressable style={styles.btn} onPress={create} disabled={busy}>
        <Text style={styles.btnText}>{busy ? "Creating..." : "Create Tournament"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.cream, padding: spacing.lg },
  label: { fontSize: 13, fontWeight: "600", color: colors.inkSoft, marginBottom: spacing.xs, marginTop: spacing.md },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.sm, padding: spacing.md, fontSize: 16 },
  hint: { fontSize: 12, color: colors.inkSoft, marginTop: spacing.lg, lineHeight: 18 },
  btn: { backgroundColor: colors.gold, borderRadius: radius.sm, padding: spacing.md, alignItems: "center", marginTop: spacing.xl },
  btnText: { fontWeight: "700", color: "#2b1c02" },
});
