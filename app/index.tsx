import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, radius } from "../constants/theme";
import { useTournaments } from "../lib/hooks";

export default function TournamentList() {
  const { data: tournaments, isLoading } = useTournaments();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>🏸 Tournaments</Text>
        <Link href="/admin" asChild>
          <Pressable style={styles.adminBtn}>
            <Text style={styles.adminBtnText}>Admin</Text>
          </Pressable>
        </Link>
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.courtBlue} />
      ) : (
        <FlatList
          data={tournaments}
          keyExtractor={(t) => t.id}
          contentContainerStyle={{ padding: spacing.lg }}
          renderItem={({ item }) => (
            <Link href={`/tournament/${item.id}`} asChild>
              <Pressable style={styles.card}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardSub}>{item.season}</Text>
                </View>
                <View style={[styles.statusBadge, item.status === "active" && styles.statusActive]}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </Pressable>
            </Link>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No tournaments yet. An admin can create one from the Admin tab.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  title: { fontSize: 28, fontWeight: "700", color: colors.ink },
  adminBtn: { backgroundColor: colors.courtBlue, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.sm },
  adminBtnText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  card: { backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, padding: spacing.lg, marginBottom: spacing.sm, flexDirection: "row", alignItems: "center" },
  cardTitle: { fontSize: 17, fontWeight: "700", color: colors.ink },
  cardSub: { fontSize: 13, color: colors.inkSoft, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: colors.line },
  statusActive: { backgroundColor: colors.win },
  statusText: { fontSize: 11, fontWeight: "600", color: colors.inkSoft, textTransform: "capitalize" },
  empty: { padding: spacing.xl, alignItems: "center" },
  emptyText: { color: colors.inkSoft, textAlign: "center" },
});
