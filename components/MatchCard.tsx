import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, radius } from "../constants/theme";
import { Match } from "../lib/types";

interface Props {
  match: Match;
  teamAName: string;
  teamBName: string;
}

export function MatchCard({ match, teamAName, teamBName }: Props) {
  const winner =
    match.score_a !== null && match.score_b !== null
      ? match.score_a > match.score_b
        ? "a"
        : match.score_b > match.score_a
        ? "b"
        : null
      : null;

  return (
    <View style={styles.card}>
      <View style={styles.rowTop}>
        <Text style={styles.matchNo}>#{match.match_no}</Text>
        {match.status === "live" && (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
      </View>
      <View style={styles.row}>
        <Text style={[styles.team, winner === "a" && styles.winnerText]} numberOfLines={1}>
          {teamAName}
        </Text>
        <Text style={styles.score}>{match.score_a ?? "-"}</Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.team, winner === "b" && styles.winnerText]} numberOfLines={1}>
          {teamBName}
        </Text>
        <Text style={styles.score}>{match.score_b ?? "-"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rowTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.xs },
  matchNo: { color: colors.inkSoft, fontSize: 12, fontWeight: "600" },
  liveBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#ffecec", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#ff5b5b" },
  liveText: { color: "#c53030", fontSize: 10, fontWeight: "700" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 2 },
  team: { fontSize: 15, color: colors.ink, flex: 1, marginRight: spacing.sm },
  winnerText: { fontWeight: "700", color: colors.goldDeep },
  score: { fontSize: 18, fontWeight: "700", color: colors.ink, minWidth: 28, textAlign: "right" },
});
