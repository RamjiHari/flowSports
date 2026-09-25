import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { colors, spacing, radius } from "../../constants/theme";
import { useTournaments } from "../../lib/hooks";
import { useAuth } from "../../lib/useAuth";

export default function AdminDashboard() {
  const { data: tournaments } = useTournaments();
  const { signOut } = useAuth();

  return (
    <View style={styles.wrap}>
      <Link href="/admin/new-tournament" asChild>
        <Pressable style={styles.newBtn}>
          <Text style={styles.newBtnText}>+ New Tournament</Text>
        </Pressable>
      </Link>

      <FlatList
        data={tournaments}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSub}>{item.season} · {item.status}</Text>
            <View style={styles.linkRow}>
              <Link href={`/admin/${item.id}/members`} asChild>
                <Pressable style={styles.linkBtn}><Text style={styles.linkText}>Members</Text></Pressable>
              </Link>
              <Link href={`/admin/${item.id}/teams`} asChild>
                <Pressable style={styles.linkBtn}><Text style={styles.linkText}>Teams</Text></Pressable>
              </Link>
              <Link href={`/admin/${item.id}/schedule`} asChild>
                <Pressable style={styles.linkBtn}><Text style={styles.linkText}>Schedule</Text></Pressable>
              </Link>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No tournaments yet — create one above.</Text>}
      />

      <Pressable style={styles.signOutBtn} onPress={() => signOut()}>
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.cream },
  newBtn: { backgroundColor: colors.gold, margin: spacing.lg, marginBottom: 0, borderRadius: radius.sm, padding: spacing.md, alignItems: "center" },
  newBtnText: { fontWeight: "700", color: "#2b1c02" },
  card: { backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, padding: spacing.lg },
  cardTitle: { fontSize: 17, fontWeight: "700", color: colors.ink },
  cardSub: { fontSize: 13, color: colors.inkSoft, marginTop: 2, marginBottom: spacing.sm },
  linkRow: { flexDirection: "row", gap: spacing.sm },
  linkBtn: { backgroundColor: colors.boysSoft, paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: radius.sm },
  linkText: { fontSize: 12, fontWeight: "600", color: colors.boys },
  empty: { textAlign: "center", color: colors.inkSoft, marginTop: spacing.xl },
  signOutBtn: { padding: spacing.lg, alignItems: "center" },
  signOutText: { color: colors.lossInk, fontWeight: "600" },
});
