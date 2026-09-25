import { Tabs } from "expo-router";
import { colors } from "../../../constants/theme";

export default function TournamentLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.courtBlueDeep },
        headerTintColor: "#fff",
        tabBarActiveTintColor: colors.courtBlue,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Matches" }} />
      <Tabs.Screen name="standings" options={{ title: "Standings" }} />
      <Tabs.Screen name="bracket" options={{ title: "Bracket" }} />
    </Tabs>
  );
}
