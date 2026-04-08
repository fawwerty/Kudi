/**
 * Kudi Mobile — AuthContext
 * Network-bound authentication logic mirroring the Next.js web application.
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchApi } from "@/lib/api";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "customer" | "business" | "admin";
  balance: number;
  currency: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  register: (data: RegisterData) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: "customer" | "business";
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const data = await fetchApi("/auth/me");
      setUser(data);
      if (data) {
        await AsyncStorage.setItem("user", JSON.stringify(data));
      }
    } catch {
      setUser(null);
      await AsyncStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function bootstrap() {
      try {
        const [token, cachedUser] = await Promise.all([
          AsyncStorage.getItem("accessToken"),
          AsyncStorage.getItem("user"),
        ]);

        if (cachedUser) {
          setUser(JSON.parse(cachedUser));
        }

        // Optimistic UI: If we have a cached user, we stop loading immediately
        // so the user can see the dashboard while we refresh in the background.
        if (cachedUser) {
          setLoading(false);
        }

        if (!token) {
          setLoading(false);
          return;
        }

        // Background refresh to ensure security and latest data
        refreshUser().finally(() => {
          setLoading(false);
        });
      } catch {
        setLoading(false);
      }
    }
    bootstrap();
  }, []);

  const register = async (data: RegisterData) => {
    await fetchApi("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  };

  const login = async (email: string, password: string) => {
    const res = await fetchApi("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    // Parallelize storage operations for speed
    await Promise.all([
      AsyncStorage.setItem("accessToken", res.accessToken),
      AsyncStorage.setItem("refreshToken", res.refreshToken),
      AsyncStorage.setItem("user", JSON.stringify(res.user)),
    ]);
    
    setUser(res.user);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("refreshToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
