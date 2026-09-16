"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getLocalProfile, hasLocalSession, type LocalProfile } from "./local-auth";

type AuthContextValue = { user: LocalProfile | null; loading: boolean; displayName: string };
const AuthContext = createContext<AuthContextValue>({ user: null, loading: true, displayName: "Estudante" });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LocalProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const refresh = () => { setUser(hasLocalSession() ? getLocalProfile() : null); setLoading(false); };
    refresh();
    window.addEventListener("arya-local-auth-change", refresh);
    window.addEventListener("storage", refresh);
    return () => { window.removeEventListener("arya-local-auth-change", refresh); window.removeEventListener("storage", refresh); };
  }, []);

  return <AuthContext.Provider value={{ user, loading, displayName: user?.name ?? "Estudante" }}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
