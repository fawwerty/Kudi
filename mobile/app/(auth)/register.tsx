/**
 * Kudi Mobile — Register Screen
 * 2-step registration. Real account creation. No shortcuts.
 */

import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform,
  ImageBackground, StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";

const C = {
  bg: "#060614", card: "#0d0b1f", border: "#1e1b3a", borderLight: "#2d2a5e",
  primary: "#6366f1", success: "#10b981", danger: "#ef4444", warning: "#f59e0b",
  txt: "#f1f5f9", txtSub: "#94a3b8", txtMuted: "#475569",
};

export default function RegisterScreen() {
  const { register } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", confirm: "", role: "customer" as "customer" | "business",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone]     = useState(false);

  const upd = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = "Full name must be at least 2 characters.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))  e.email = "Enter a valid email address.";
    if (!/^0\d{9}$/.test(form.phone.replace(/\s/g, ""))) e.phone = "Enter valid Ghana number (e.g. 0244123456).";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (form.password.length < 8)           e.password = "Minimum 8 characters.";
    else if (!/[A-Z]/.test(form.password))  e.password = "Must include an uppercase letter.";
    else if (!/[0-9]/.test(form.password))  e.password = "Must include a number.";
    if (form.password !== form.confirm)     e.confirm  = "Passwords do not match.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const pwStrength = () => {
    let s = 0;
    if (form.password.length >= 8) s++;
    if (/[A-Z]/.test(form.password)) s++;
    if (/[0-9]/.test(form.password)) s++;
    if (/[^A-Za-z0-9]/.test(form.password)) s++;
    return s;
  };
  const pwColors = ["", C.danger, C.warning, "#22d3ee", C.success];
  const pwLabels = ["", "Weak", "Fair", "Good", "Strong"];

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setLoading(true);
    try {
      await register(form);
      setDone(true);
    } catch (err: any) {
      setErrors({ submit: err.message });
    }
    setLoading(false);
  };

  const ErrMsg = ({ field }: { field: string }) =>
    errors[field] ? <Text style={styles.errTxt}>⚠ {errors[field]}</Text> : null;

  if (done) {
    return (
      <ImageBackground source={require("../../assets/images/kudi_hero_bg.png")} style={styles.doneRoot} imageStyle={{ opacity: 0.3 }}>
        <StatusBar barStyle="light-content" />
        <View style={styles.overlay} />
        <View style={{ alignItems: "center", zIndex: 1 }}>
          <Text style={{ fontSize: 60, marginBottom: 16 }}>🎉</Text>
          <Text style={styles.doneTitle}>Account Created!</Text>
          <Text style={styles.doneSub}>Welcome to Kudi, {form.name.split(" ")[0]}!</Text>
          <Text style={styles.doneMuted}>Your account is ready. Please sign in to continue.</Text>
          <TouchableOpacity style={[styles.btn, { marginTop: 32 }]} onPress={() => router.replace("/(auth)/login")}>
            <Text style={styles.btnTxt}>Sign In Now →</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require("../../assets/images/kudi_hero_bg.png")}
      style={{ flex: 1, backgroundColor: C.bg }}
      imageStyle={{ opacity: 0.3 }}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.overlay} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.logoRow}>
          <View style={styles.logoBox}>
            <Text style={styles.logoSym}>₵</Text>
          </View>
          <Text style={styles.logoTxt}>Kudi</Text>
        </View>

        <View style={styles.card}>
          {/* Progress bar */}
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 24 }}>
            {[1, 2].map((s) => (
              <View key={s} style={{ flex: 1, height: 3, borderRadius: 4, backgroundColor: s <= step ? C.primary : C.border }} />
            ))}
          </View>

          <Text style={styles.title}>{step === 1 ? "Create your account" : "Set your password"}</Text>
          <Text style={styles.subtitle}>Step {step} of 2</Text>

          {/* ── Step 1 ── */}
          {step === 1 && (
            <>
              <View style={styles.field}>
                <Text style={styles.label}>Full name</Text>
                <TextInput style={styles.input} placeholder="e.g. Kwafo Nathaniel" placeholderTextColor={C.txtMuted} value={form.name} onChangeText={(v) => upd("name", v)} />
                <ErrMsg field="name" />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Email address</Text>
                <TextInput style={styles.input} placeholder="you@example.com" placeholderTextColor={C.txtMuted} value={form.email} onChangeText={(v) => upd("email", v)} keyboardType="email-address" autoCapitalize="none" />
                <ErrMsg field="email" />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Phone (Ghana)</Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <View style={styles.flagBox}><Text style={{ color: C.txtSub, fontSize: 13 }}>🇬🇭 +233</Text></View>
                  <TextInput style={[styles.input, { flex: 1 }]} placeholder="024 XXX XXXX" placeholderTextColor={C.txtMuted} value={form.phone} onChangeText={(v) => upd("phone", v)} keyboardType="phone-pad" />
                </View>
                <ErrMsg field="phone" />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Account type</Text>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  {(["customer", "business"] as const).map((val) => (
                    <TouchableOpacity key={val} onPress={() => upd("role", val)}
                      style={{ flex: 1, borderRadius: 12, borderWidth: 1, borderColor: form.role === val ? C.primary : C.borderLight, backgroundColor: form.role === val ? `${C.primary}20` : C.bg, padding: 14, alignItems: "center" }}>
                      <Text style={{ fontSize: 20, marginBottom: 4 }}>{val === "customer" ? "👤" : "🏢"}</Text>
                      <Text style={{ color: form.role === val ? C.txt : C.txtSub, fontWeight: "600", fontSize: 13, textTransform: "capitalize" }}>{val}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <TouchableOpacity style={styles.btn} onPress={() => { if (validateStep1()) setStep(2); }} activeOpacity={0.85}>
                <Text style={styles.btnTxt}>Continue →</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <>
              <View style={styles.field}>
                <Text style={styles.label}>Create password</Text>
                <TextInput style={styles.input} placeholder="Min 8 chars, 1 uppercase, 1 number" placeholderTextColor={C.txtMuted} value={form.password} onChangeText={(v) => upd("password", v)} secureTextEntry autoCapitalize="none" />
                {form.password.length > 0 && (
                  <View style={{ marginTop: 8 }}>
                    <View style={{ flexDirection: "row", gap: 4, marginBottom: 4 }}>
                      {[1, 2, 3, 4].map((i) => (
                        <View key={i} style={{ flex: 1, height: 3, borderRadius: 4, backgroundColor: i <= pwStrength() ? pwColors[pwStrength()] : C.border }} />
                      ))}
                    </View>
                    <Text style={{ fontSize: 12, color: pwColors[pwStrength()] || C.txtMuted }}>
                      Strength: {pwLabels[pwStrength()] || "—"}
                    </Text>
                  </View>
                )}
                <ErrMsg field="password" />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Confirm password</Text>
                <TextInput style={styles.input} placeholder="Repeat your password" placeholderTextColor={C.txtMuted} value={form.confirm} onChangeText={(v) => upd("confirm", v)} secureTextEntry autoCapitalize="none" />
                <ErrMsg field="confirm" />
              </View>
              {errors.submit && (
                <View style={styles.errBox}><Text style={styles.errBig}>⚠️ {errors.submit}</Text></View>
              )}
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity style={styles.btnGhost} onPress={() => { setStep(1); setErrors({}); }} activeOpacity={0.8}>
                  <Text style={styles.btnGhostTxt}>← Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, { flex: 2 }, loading && styles.btnDisabled]} onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
                  {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.btnTxt}>Create Account 🎉</Text>}
                </TouchableOpacity>
              </View>
            </>
          )}

          <View style={styles.linkRow}>
            <Text style={styles.linkGray}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
              <Text style={styles.link}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  overlay:   { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(6,6,20,0.7)" },
  scroll:    { flexGrow: 1, justifyContent: "center", padding: 20 },
  doneRoot:  { flex: 1, backgroundColor: C.bg, justifyContent: "center", alignItems: "center", padding: 32 },
  doneTitle: { color: C.txt, fontSize: 26, fontWeight: "800", marginBottom: 8 },
  doneSub:   { color: C.txtSub, fontSize: 16, marginBottom: 6 },
  doneMuted: { color: C.txtMuted, fontSize: 14, textAlign: "center", lineHeight: 20 },
  logoRow:   { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 28 },
  logoBox:   { width: 42, height: 42, borderRadius: 13, backgroundColor: C.primary, alignItems: "center", justifyContent: "center" },
  logoSym:   { color: "#fff", fontSize: 20, fontWeight: "800" },
  logoTxt:   { color: C.txt, fontSize: 26, fontWeight: "800", letterSpacing: -0.5 },
  card:      { backgroundColor: C.card, borderRadius: 22, padding: 26, borderWidth: 1, borderColor: C.border },
  title:     { color: C.txt, fontSize: 22, fontWeight: "700", marginBottom: 4 },
  subtitle:  { color: C.txtSub, fontSize: 14, marginBottom: 22 },
  field:     { marginBottom: 14 },
  label:     { color: C.txtSub, fontSize: 13, fontWeight: "600", marginBottom: 6 },
  input:     { backgroundColor: C.bg, borderWidth: 1, borderColor: C.borderLight, borderRadius: 12, padding: 13, color: C.txt, fontSize: 15 },
  flagBox:   { backgroundColor: C.bg, borderWidth: 1, borderColor: C.borderLight, borderRadius: 11, padding: 13, justifyContent: "center" },
  errTxt:    { color: C.danger, fontSize: 12, marginTop: 4 },
  errBox:    { backgroundColor: "#ef444415", borderWidth: 1, borderColor: "#ef444440", borderRadius: 10, padding: 12, marginBottom: 12 },
  errBig:    { color: "#fca5a5", fontSize: 13, lineHeight: 18 },
  btn:       { backgroundColor: C.primary, borderRadius: 12, padding: 14, alignItems: "center" },
  btnDisabled: { opacity: 0.6 },
  btnTxt:    { color: "#fff", fontWeight: "700", fontSize: 15 },
  btnGhost:  { flex: 1, borderRadius: 12, borderWidth: 1, borderColor: C.borderLight, padding: 14, alignItems: "center" },
  btnGhostTxt: { color: C.txtSub, fontWeight: "600", fontSize: 14 },
  linkRow:   { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  linkGray:  { color: C.txtMuted, fontSize: 13 },
  link:      { color: C.primary, fontWeight: "700", fontSize: 13 },
});
