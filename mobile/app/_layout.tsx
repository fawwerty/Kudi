/**
 * Kudi Mobile — Root Layout
 * Wraps entire app with AuthProvider + ThemeProvider.
 */

import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { C, isDarkMode } = useTheme();
  const router   = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === "(auth)";
    const inWelcome = segments[0] === "welcome";

    if (!user && !inAuth && !inWelcome) {
      router.replace("/welcome");
    } else if (user && (inAuth || inWelcome)) {
      router.replace("/(tabs)");
    }
  }, [user, loading, segments]);

  // Show loading only if we have no user AND we are still fetching the initial state
  if (loading && !user) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDarkMode ? "light" : "dark"} backgroundColor={C.bg} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg } }} />
      {children}
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({});
  if (!fontsLoaded) return null;

  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthGuard>{null}</AuthGuard>
      </AuthProvider>
    </ThemeProvider>
  );
}
