import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, radius } from "../../constants/theme";
import { useAuth } from "../../lib/useAuth";

export default function LoginScreen() {
  const { signInWithOtp, verifyOtp } = useAuth();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState(false);

  async function sendCode() {
    if (!email.includes("@")) {
      Alert.alert("Enter a valid email");
      return;
    }
    setBusy(true);
    const { error } = await signInWithOtp(email);
    setBusy(false);
    if (error) {
      Alert.alert("Could not send code", error.message);
      return;
    }
    setStage("code");
  }

  async function confirmCode() {
    setBusy(true);
    const { error } = await verifyOtp(email, code);
    setBusy(false);
    if (error) Alert.alert("Invalid code", error.message);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.center}>
        <Text style={styles.title}>🏸 Admin Sign In</Text>
        <Text style={styles.sub}>Only tournament admins need to sign in. Everyone else can browse the app freely without an account.</Text>

        {stage === "email" ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={colors.inkSoft}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <Pressable style={styles.btn} onPress={sendCode} disabled={busy}>
              <Text style={styles.btnText}>{busy ? "Sending..." : "Send code"}</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.sub}>Enter the 6-digit code sent to {email}</Text>
            <TextInput
              style={styles.input}
              placeholder="123456"
              placeholderTextColor={colors.inkSoft}
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
            />
            <Pressable style={styles.btn} onPress={confirmCode} disabled={busy}>
              <Text style={styles.btnText}>{busy ? "Verifying..." : "Verify"}</Text>
            </Pressable>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.courtBlueDeep },
  center: { flex: 1, justifyContent: "center", padding: spacing.xl },
  title: { fontSize: 28, fontWeight: "700", color: "#fff", marginBottom: spacing.sm, textAlign: "center" },
  sub: { color: "#cfe0ee", fontSize: 13, textAlign: "center", marginBottom: spacing.lg },
  input: { backgroundColor: "#fff", borderRadius: radius.sm, padding: spacing.md, fontSize: 16, marginBottom: spacing.md },
  btn: { backgroundColor: colors.gold, borderRadius: radius.sm, padding: spacing.md, alignItems: "center" },
  btnText: { fontWeight: "700", color: "#2b1c02", fontSize: 15 },
});
