import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ThemeColors {
  bg: string;
  card: string;
  border: string;
  borderLight: string;
  primary: string;
  primaryDark?: string;
  success: string;
  danger: string;
  warning: string;
  txt: string;
  txtSub: string;
  txtMuted: string;
}

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  C: ThemeColors;
}

const darkColors: ThemeColors = {
  bg: "#060614", card: "#0d0b1f", border: "#1e1b3a", borderLight: "#2d2a5e",
  primary: "#6366f1", primaryDark: "#4f46e5", success: "#10b981", danger: "#ef4444", warning: "#f59e0b",
  txt: "#f1f5f9", txtSub: "#94a3b8", txtMuted: "#475569",
};

const lightColors: ThemeColors = {
  bg: "#f8fafc", card: "#ffffff", border: "#e2e8f0", borderLight: "#f1f5f9",
  primary: "#6366f1", primaryDark: "#4f46e5", success: "#10b981", danger: "#ef4444", warning: "#f59e0b",
  txt: "#0f172a", txtSub: "#475569", txtMuted: "#94a3b8",
};

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: true,
  toggleTheme: () => {},
  C: darkColors,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemScheme === "dark");

  useEffect(() => {
    async function loadTheme() {
      try {
        const stored = await AsyncStorage.getItem("theme");
        if (stored !== null) {
          setIsDarkMode(stored === "dark");
        }
      } catch (err) {}
    }
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    try {
      await AsyncStorage.setItem("theme", newTheme ? "dark" : "light");
    } catch (err) {}
  };

  const C = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, C }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
