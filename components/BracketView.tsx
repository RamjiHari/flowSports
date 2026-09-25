import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, radius } from "../constants/theme";
import { Bracket } from "../lib/standings";

interface Props {
  bracket: Bracket;
  teamName: (id: string | null) => string;
}

function Stage({ label, teamAName, teamBName, winnerName, resultLabel, highlight }: { label: string; teamAName: string; teamBName: string; winnerName: string | null; resultLabel: string; highlight?: boolean }) {
  return (
    <View style={[styles.stage, highlight && styles.stageFinal]}>
      <Text style={styles.stageLabel}>{label}</Text>
      <Text style={styles.stageTeam}>{teamAName}</Text>
      <Text style={styles.stageVs}>vs</Text>
      <Text style={styles.stageTeam}>{teamBName}</Text>
      {winnerName && (
        <View style={styles.result}>
          <Text style={styles.resultLabel}>{resultLabel}</Text>
          <Text style={styles.resultName} numberOfLines={1}>
            {winnerName}
          </Text>
        </View>
      )}
    </View>
  );
}

export function BracketView({ bracket, teamName }: Props) {
  if (!bracket.ready) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Finish every League match to unlock the knockout bracket.</Text>
      </View>
    );
  }

  const tn = (id: string | null) => (id ? teamName(id) : "TBD");

  return (
    <View>
      <Text style={styles.note}>
        Seed 1 vs Seed 2 winner goes straight to the Final. Seed 3 vs Seed 4's winner plays the Seed 1-2 loser
        ("Runner") in Match 3 for the 2nd Final spot.
      </Text>
      <Stage label="Match 1 · Seed 1 vs Seed 2" teamAName={tn(bracket.m1.teamAId)} teamBName={tn(bracket.m1.teamBId)} winnerName={bracket.m1.winnerId ? tn(bracket.m1.winnerId) : null} resultLabel="Winner -> Direct Finalist" />
      <View style={styles.connector} />
      <Stage label="Match 2 · Seed 3 vs Seed 4" teamAName={tn(bracket.m2.teamAId)} teamBName={tn(bracket.m2.teamBId)} winnerName={bracket.m2.winnerId ? tn(bracket.m2.winnerId) : null} resultLabel="Winner -> plays Runner" />
      <View style={styles.connector} />
      <Stage label="Match 3 · Runner vs Match 2 winner" teamAName={tn(bracket.m3.teamAId)} teamBName={tn(bracket.m3.teamBId)} winnerName={bracket.m3.winnerId ? tn(bracket.m3.winnerId) : null} resultLabel="Winner -> 2nd Finalist" />
      <View style={styles.connector} />
      <Stage label="Final" teamAName={tn(bracket.final.teamAId)} teamBName={tn(bracket.final.teamBId)} winnerName={null} resultLabel="" highlight />

      {bracket.champion && (
        <View style={styles.championBanner}>
          <Text style={styles.trophy}>🏆</Text>
          <View>
            <Text style={styles.championLabel}>CHAMPION</Text>
            <Text style={styles.championName}>{tn(bracket.champion)}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { padding: spacing.lg, alignItems: "center" },
  emptyText: { color: colors.inkSoft, fontSize: 13, textAlign: "center" },
  note: { fontSize: 12.5, color: colors.inkSoft, lineHeight: 18, marginBottom: spacing.md },
  stage: { backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.lineStrong, borderRadius: radius.md, padding: spacing.md },
  stageFinal: { borderColor: colors.gold, borderWidth: 2 },
  stageLabel: { fontSize: 11, fontWeight: "700", color: colors.inkSoft, marginBottom: spacing.sm },
  stageTeam: { fontSize: 14, fontWeight: "500", color: colors.ink },
  stageVs: { fontSize: 11, color: colors.inkSoft, marginVertical: 2 },
  result: { marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.line, flexDirection: "row", justifyContent: "space-between" },
  resultLabel: { fontSize: 12, color: colors.inkSoft },
  resultName: { fontSize: 13, fontWeight: "700", color: colors.ink, flexShrink: 1, marginLeft: spacing.sm },
  connector: { width: 2, height: 14, backgroundColor: colors.lineStrong, alignSelf: "center" },
  championBanner: { marginTop: spacing.md, backgroundColor: colors.gold, borderRadius: radius.md, padding: spacing.md, flexDirection: "row", alignItems: "center", gap: spacing.sm },
  trophy: { fontSize: 26 },
  championLabel: { fontSize: 11, fontWeight: "700", color: "#2b1c02", opacity: 0.75 },
  championName: { fontSize: 20, fontWeight: "700", color: "#2b1c02" },
});
