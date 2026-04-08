/**
 * Kudi Mobile — Welcome Landing Screen
 * High-end visual entry point with Brand Hero & Auth buttons.
 */
import React from "react";
import {
  View, Text, StyleSheet, ImageBackground, TouchableOpacity,
  Dimensions, StatusBar, SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();
  const { C, isDarkMode } = useTheme();

  return (
    <ImageBackground
      source={require("../assets/images/kudi_hero_bg.png")}
      style={styles.root}
      imageStyle={{ opacity: 0.4 }}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          {/* Brand Logo / Symbol */}
          <View style={styles.header}>
            <View style={styles.logoBox}>
              <Text style={styles.logoSymbol}>₵</Text>
            </View>
            <Text style={styles.brandName}>Kudi</Text>
          </View>

          {/* Hero Text */}
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>Finance,{"\n"}elegantly{"\n"}engineered.</Text>
            <Text style={styles.heroSub}>Ghana's smart financial companion. Experience the future of banking in the palm of your hand.</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.primaryBtn}
              onPress={() => router.push("/(auth)/register")}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryBtnTxt}>Get Started — Free</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryBtn}
              onPress={() => router.push("/(auth)/login")}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryBtnTxt}>Log in to your account</Text>
            </TouchableOpacity>

            <Text style={styles.legalTxt}>
              By continuing, you agree to our Terms of Service{"\n"}and Privacy Policy.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#020205",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2,2,5,0.75)",
  },
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: "space-between",
    paddingTop: 40,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#6366f1",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6366f1",
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 10,
  },
  logoSymbol: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
  },
  brandName: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  heroTextContainer: {
    marginTop: height * 0.05,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 48,
    fontWeight: "800",
    lineHeight: 52,
    letterSpacing: -1.5,
    marginBottom: 20,
  },
  heroSub: {
    color: "#a1a1aa",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400",
  },
  footer: {
    gap: 16,
    paddingBottom: 20,
  },
  primaryBtn: {
    backgroundColor: "#fff",
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: "center",
    shadowColor: "#fff",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  primaryBtnTxt: {
    color: "#020205",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryBtn: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: "center",
  },
  secondaryBtnTxt: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  legalTxt: {
    color: "#52525b",
    fontSize: 12,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 18,
  }
});
