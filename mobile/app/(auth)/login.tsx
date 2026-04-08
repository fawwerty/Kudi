/**
 * Kudi Mobile — Login Screen (with background image + biometric)
 */

import { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform,
  ImageBackground, StatusBar, Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";

const C = {
  bg: "#000000", card: "#0a0a0f", border: "#1f1f2e", borderLight: "#2d2d44",
  primary: "#6366f1", primaryDark: "#4f46e5",
  txt: "#ffffff", txtSub: "#a1a1aa", txtMuted: "#52525b",
};

export default function LoginScreen() {
  const { login } = useAuth();
  const router    = useRouter();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled,   setBiometricEnabled]   = useState(false);

  useEffect(() => {
    async function checkBiometrics() {
      try {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled   = await LocalAuthentication.isEnrolledAsync();
        const enabled    = await AsyncStorage.getItem("biometricEnabled");
        setBiometricAvailable(compatible && enrolled);
        setBiometricEnabled(enabled === "true");
      } catch {}
    }
    checkBiometrics();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await login(email.trim(), password);
      // Save for biometrics
      await AsyncStorage.setItem("lastEmail", email.trim());
      await AsyncStorage.setItem("lastPassword", password);
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    }
    setLoading(false);
  };


  const handleBiometricLogin = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Login to Kudi",
        fallbackLabel: "Use Password",
        disableDeviceFallback: false,
      });
      if (result.success) {
        // Re-login using stored credentials (if available)
        const storedEmail = await AsyncStorage.getItem("lastEmail");
        const storedPassword = await AsyncStorage.getItem("lastPassword");
        if (storedEmail && storedPassword) {
          setLoading(true);
          try {
            await login(storedEmail, storedPassword);
          } catch (err: any) {
            setError("Biometric login failed: " + (err.message || "Please use password."));
          }
          setLoading(false);
        } else {
          Alert.alert("Setup Required", "Please log in with your email and password first to set up biometric login.");
        }
      }
    } catch (err) {
      Alert.alert("Biometric Error", "Biometric authentication failed. Please use your password.");
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/kudi_hero_bg.png")}
      style={styles.root}
      imageStyle={{ opacity: 0.35 }}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.overlay} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Logo */}
          <View style={styles.logoRow}>
            <View style={styles.logoBox}>
              <Text style={styles.logoSymbol}>₵</Text>
            </View>
            <Text style={styles.logoText}>Kudi</Text>
          </View>
          <Text style={styles.tagline}>Ghana's Smart Financial Companion</Text>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to your account to continue</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Email address</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={C.txtMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.pwRow}>
                <TextInput
                  style={[styles.input, { flex: 1, borderRadius: 10 }]}
                  placeholder="••••••••"
                  placeholderTextColor={C.txtMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPw}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPw(!showPw)} style={styles.eyeBtn}>
                  <Text style={{ fontSize: 18 }}>{showPw ? "🙈" : "👁️"}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorTxt}>⚠️ {error}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.btnTxt}>Sign In →</Text>
              }
            </TouchableOpacity>

            {/* Biometric Button */}
            {biometricAvailable && biometricEnabled && (
              <TouchableOpacity
                style={styles.biometricBtn}
                onPress={handleBiometricLogin}
                activeOpacity={0.8}
              >
                <Text style={styles.biometricIcon}>
                  {Platform.OS === "ios" ? "🔒 Face ID" : "👆 Fingerprint"}
                </Text>
                <Text style={styles.biometricTxt}>Login with Biometrics</Text>
              </TouchableOpacity>
            )}

            <View style={styles.linkRow}>
              <Text style={styles.linkGray}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                <Text style={styles.link}>Create one free</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root:         { flex: 1, backgroundColor: C.bg },
  overlay:      { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(2,2,5,0.65)" },
  scroll:       { flexGrow: 1, justifyContent: "center", padding: 24 },
  logoRow:      { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 },
  logoBox:      { width: 46, height: 46, borderRadius: 14, backgroundColor: C.primary, alignItems: "center", justifyContent: "center", shadowColor: C.primary, shadowOpacity: 0.6, shadowRadius: 14 },
  logoSymbol:   { color: "#fff", fontSize: 22, fontWeight: "800" },
  logoText:     { color: C.txt, fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  tagline:      { color: C.txtSub, fontSize: 14, textAlign: "center", marginBottom: 36 },
  card:         { backgroundColor: "rgba(10,10,15,0.9)", borderRadius: 24, padding: 28, borderWidth: 1, borderColor: C.border },
  title:        { color: C.txt, fontSize: 22, fontWeight: "700", marginBottom: 4 },
  subtitle:     { color: C.txtSub, fontSize: 14, marginBottom: 24 },
  field:        { marginBottom: 16 },
  label:        { color: C.txtSub, fontSize: 13, fontWeight: "600", marginBottom: 6 },
  input:        { backgroundColor: "rgba(0,0,0,0.6)", borderWidth: 1, borderColor: C.borderLight, borderRadius: 12, padding: 13, color: C.txt, fontSize: 15 },
  pwRow:        { flexDirection: "row", alignItems: "center", gap: 8 },
  eyeBtn:       { padding: 10 },
  errorBox:     { backgroundColor: "#ef444415", borderWidth: 1, borderColor: "#ef444440", borderRadius: 10, padding: 12, marginBottom: 14 },
  errorTxt:     { color: "#fca5a5", fontSize: 13, lineHeight: 18 },
  btn:          { backgroundColor: C.primary, borderRadius: 12, padding: 15, alignItems: "center", marginTop: 6, shadowColor: C.primary, shadowOpacity: 0.5, shadowRadius: 12 },
  btnDisabled:  { opacity: 0.6 },
  btnTxt:       { color: "#fff", fontWeight: "700", fontSize: 15, letterSpacing: 0.3 },
  biometricBtn: { marginTop: 14, borderWidth: 1, borderColor: C.borderLight, borderRadius: 12, padding: 14, alignItems: "center", backgroundColor: "rgba(99,102,241,0.1)" },
  biometricIcon:{ fontSize: 20, marginBottom: 4 },
  biometricTxt: { color: C.primary, fontWeight: "700", fontSize: 13 },
  linkRow:      { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  linkGray:     { color: C.txtMuted, fontSize: 13 },
  link:         { color: C.primary, fontWeight: "700", fontSize: 13 },
});
