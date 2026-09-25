import { Stack } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "../../lib/useAuth";
import { colors } from "../../constants/theme";
import LoginScreen from "./login";

export default function AdminLayout() {
  const { loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.cream }}>
        <ActivityIndicator color={colors.courtBlue} />
      </View>
    );
  }

  if (!isAdmin) {
    return <LoginScreen />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.courtBlueDeep },
        headerTintColor: "#fff",
      }}
    >
      <Stack.Screen name="index" options={{ title: "Admin Dashboard" }} />
      <Stack.Screen name="new-tournament" options={{ title: "New Tournament" }} />
      <Stack.Screen name="[tournamentId]/members" options={{ title: "Members" }} />
      <Stack.Screen name="[tournamentId]/teams" options={{ title: "Teams" }} />
      <Stack.Screen name="[tournamentId]/schedule" options={{ title: "Schedule & Matches" }} />
      <Stack.Screen name="[tournamentId]/match/[matchId]" options={{ title: "Match" }} />
    </Stack>
  );
}
