"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { useRouter, usePathname } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  balance: number;
  currency: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  hideBalance: boolean;
  toggleBalanceVisibility: () => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  refreshUser: async () => {},
  hideBalance: false,
  toggleBalanceVisibility: () => {},
  logout: () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hideBalance, setHideBalance] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const toggleBalanceVisibility = () => setHideBalance(!hideBalance);

  const logout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
    router.push("/login");
  };

  const refreshUser = async () => {
    try {
      const data = await fetchApi("/auth/me");
      setUser(data);
    } catch (err) {
      setUser(null);
      if (!pathname.includes("/login") && !pathname.includes("/register") && pathname !== "/") {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [pathname]);

  return (
    <UserContext.Provider value={{ user, loading, refreshUser, hideBalance, toggleBalanceVisibility, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
