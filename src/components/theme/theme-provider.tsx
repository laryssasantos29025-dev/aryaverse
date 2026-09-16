"use client";

import { createContext, useContext, useEffect, useState } from "react";

export const themes = [
  { id: "enchanted-water", name: "Enchanted Water" }, { id: "fairy-garden", name: "Fairy Garden" },
  { id: "moon-library", name: "Moon Library" }, { id: "galaxy", name: "Galaxy" },
  { id: "cozy-cafe", name: "Cozy Café" }, { id: "classic-paper", name: "Classic Paper" },
  { id: "minimal-white", name: "Minimal White" }, { id: "ocean-dream", name: "Ocean Dream" },
  { id: "cherry-blossom", name: "Cherry Blossom" }, { id: "dark-academy", name: "Dark Academy" },
] as const;

type ThemeId = (typeof themes)[number]["id"];
type ThemeContextValue = { theme: ThemeId; setTheme: (theme: ThemeId) => void; reduceMotion: boolean; setReduceMotion: (value: boolean) => void };
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeId>(() => {
    if (typeof window === "undefined") return "enchanted-water";
    const saved = localStorage.getItem("arya-theme") as ThemeId | null;
    return saved && themes.some((item) => item.id === saved) ? saved : "enchanted-water";
  });
  const [reduceMotion, setReduceMotion] = useState(() => typeof window !== "undefined" && localStorage.getItem("arya-reduce-motion") === "true");
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme === "galaxy" || theme === "dark-academy" ? "dark" : "light";
    localStorage.setItem("arya-theme", theme);
  }, [theme]);
  useEffect(() => { document.documentElement.dataset.reduceMotion = String(reduceMotion); localStorage.setItem("arya-reduce-motion", String(reduceMotion)); }, [reduceMotion]);
  return <ThemeContext.Provider value={{ theme, setTheme, reduceMotion, setReduceMotion }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme deve ser usado dentro de ThemeProvider");
  return context;
}
