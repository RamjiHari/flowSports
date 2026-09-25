import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, radius } from "../constants/theme";
import { StandingsRow } from "../lib/types";

export function StandingsTable({ rows }: { rows: StandingsRow[] }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, { width: 24 }]}>#</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>Team</Text>
        <Text style={[styles.headerCell, styles.num]}>P</Text>
        <Text style={[styles.headerCell, styles.num]}>W</Text>
        <Text style={[styles.headerCell, styles.num]}>T</Text>
        <Text style={[styles.headerCell, styles.num]}>L</Text>
        <Text style={[styles.headerCell, styles.num]}>Pts</Text>
      </View>
      {rows.map((r, i) => (
        <View key={r.team_id} style={[styles.row, i < 4 && styles.top4]}>
          <View style={[styles.rankPill, i < 4 && styles.rankPillTop4]}>
            <Text style={[styles.rankText, i < 4 && styles.rankTextTop4]}>{r.rank}</Text>
          </View>
          <Text style={styles.teamName} numberOfLines={1}>
            {r.team_name}
          </Text>
          <Text style={styles.num}>{r.played}</Text>
          <Text style={styles.num}>{r.won}</Text>
          <Text style={styles.num}>{r.tied}</Text>
          <Text style={styles.num}>{r.lost}</Text>
          <Text style={styles.points}>{r.points}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, overflow: "hidden" },
  headerRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.lineStrong },
  headerCell: { fontSize: 11, fontWeight: "700", color: colors.inkSoft },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.line, gap: 6 },
  top4: { backgroundColor: "#fdf7ea" },
  rankPill: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.line, alignItems: "center", justifyContent: "center" },
  rankPillTop4: { backgroundColor: colors.gold },
  rankText: { fontSize: 12, fontWeight: "700", color: colors.inkSoft },
  rankTextTop4: { color: "#2b1c02" },
  teamName: { flex: 1, fontSize: 14, fontWeight: "500", color: colors.ink, marginLeft: spacing.sm },
  num: { width: 24, textAlign: "center", fontSize: 13, color: colors.inkSoft },
  points: { width: 30, textAlign: "center", fontSize: 16, fontWeight: "700", color: colors.ink },
});
