import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { isSupabaseConfigured } from "../lib/supabase";

function ConfigError() {
  return (
    <View style={styles.error}>
      <Text style={styles.errorTitle}>Setup needed</Text>
      <Text style={styles.errorBody}>
        This build is missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY.{"\n\n"}
        Set them as EAS environment variables (or in .env for local dev) and rebuild.
      </Text>
    </View>
  );
}

export default function RootLayout() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchInterval: 5000, // poll every 5s so live matches feel live
            refetchOnWindowFocus: true,
          },
        },
      })
  );

  if (!isSupabaseConfigured) {
    return <ConfigError />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="tournament/[id]" />
        <Stack.Screen name="admin" />
      </Stack>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  error: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "#123a5e" },
  errorTitle: { color: "#fff", fontSize: 20, fontWeight: "700", marginBottom: 12 },
  errorBody: { color: "#e3ecf5", fontSize: 14, textAlign: "center", lineHeight: 20 },
});
