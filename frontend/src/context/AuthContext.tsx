"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, SavedSound } from "@/types/auth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signUp: (email: string, username: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  saveSound: (sound: Omit<SavedSound, "id" | "savedAt">) => void;
  removeSavedSound: (soundId: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("obi_user");
      if (stored) setUser(JSON.parse(stored));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const persist = (u: User) => {
    localStorage.setItem("obi_user", JSON.stringify(u));
    setUser(u);
  };

  // TEMP mocks — swap these for real fetch() calls when backend is ready
  const signUp = async (email: string, username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      persist({ id: crypto.randomUUID(), email, username, createdAt: new Date().toISOString(), savedSounds: [] });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Sign-up failed");
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      persist({ id: "mock-id", email, username: email.split("@")[0], createdAt: new Date().toISOString(), savedSounds: [] });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Login failed");
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("obi_user");
    setUser(null);
  };

  const saveSound = (sound: Omit<SavedSound, "id" | "savedAt">) => {
    if (!user) return;
    const updated = { ...user, savedSounds: [{ ...sound, id: crypto.randomUUID(), savedAt: new Date().toISOString() }, ...user.savedSounds] };
    persist(updated);
  };

  const removeSavedSound = (soundId: string) => {
    if (!user) return;
    persist({ ...user, savedSounds: user.savedSounds.filter(s => s.id !== soundId) });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error, signUp, login, logout, saveSound, removeSavedSound }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}