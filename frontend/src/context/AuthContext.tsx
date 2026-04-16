"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, SavedSound } from "@/types/auth";

const API = process.env.NEXT_PUBLIC_BACKEND_URL;
console.log("[AuthContext] API base URL:", API);

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signUp: (email: string, username: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  saveSound: (sound: Omit<SavedSound, "id" | "savedAt">) => Promise<void>;
  removeSavedSound: (soundId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const authFetch = (path: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("obi_token");
  return fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // On mount, restore session from token
  useEffect(() => {
    const token = localStorage.getItem("obi_token");
    if (!token) { setIsLoading(false); return; }

    authFetch("/auth/me")
      .then(res => res.ok ? res.json() : null)
      .then(async me => {
        if (!me) { localStorage.removeItem("obi_token"); return; }
        const sounds = await fetchSounds();
        setUser({ id: me.id, email: me.email, username: me.username, createdAt: new Date().toISOString(), savedSounds: sounds });
      })
      .catch(() => localStorage.removeItem("obi_token"))
      .finally(() => setIsLoading(false));
  }, []);

  const fetchSounds = async (): Promise<SavedSound[]> => {
    const res = await authFetch("/users/sounds");
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((s: {id: number, title: string, bpm?: number, tags?: string[], year?: number, match_percent?: number}) => ({
      id: String(s.id),
      title: s.title,
      bpm: s.bpm,
      tags: s.tags ?? [],
      year: s.year,
      matchPercent: s.match_percent,
      savedAt: new Date().toISOString(),
    }));
  };

  const signUp = async (email: string, username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
      });
      if (!res.ok) throw new Error("Backend rejected registration");
      const data = await res.json();
      localStorage.setItem("obi_token", data.access_token);

      const meRes = await authFetch("/auth/me");
      const me = await meRes.json();
      setUser({ id: me.id, email: me.email, username: me.username, createdAt: new Date().toISOString(), savedSounds: [] });
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
      console.log("[login] POSTing to:", `${API}/auth/login`);
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      console.log("[login] Response status:", res.status);
      if (!res.ok) {
        const errBody = await res.text();
        console.error("[login] Error body:", errBody);
        throw new Error(`Backend rejected login (${res.status}): ${errBody}`);
      }
      const data = await res.json();
      localStorage.setItem("obi_token", data.access_token);

      const meRes = await authFetch("/auth/me");
      const me = await meRes.json();
      const sounds = await fetchSounds();
      setUser({ id: me.id, email: me.email, username: me.username, createdAt: new Date().toISOString(), savedSounds: sounds });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Login failed");
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("obi_token");
    setUser(null);
  };

  const saveSound = async (sound: Omit<SavedSound, "id" | "savedAt">) => {
    if (!user) return;
    const res = await authFetch("/users/sounds", {
      method: "POST",
      body: JSON.stringify({
        title: sound.title,
        bpm: sound.bpm ?? null,
        tags: sound.tags ?? [],
        year: sound.year ?? null,
        match_percent: sound.matchPercent ?? null,
      }),
    });
    if (!res.ok) return;
    const saved = await res.json();
    const newSound: SavedSound = {
      id: String(saved.id),
      title: saved.title,
      bpm: saved.bpm,
      tags: saved.tags ?? [],
      year: saved.year,
      matchPercent: saved.match_percent,
      savedAt: new Date().toISOString(),
    };
    setUser({ ...user, savedSounds: [newSound, ...user.savedSounds] });
  };

  const removeSavedSound = async (soundId: string) => {
    if (!user) return;
    const res = await authFetch(`/users/sounds/${soundId}`, { method: "DELETE" });
    if (!res.ok) return;
    setUser({ ...user, savedSounds: user.savedSounds.filter(s => s.id !== soundId) });
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