"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookPortalTransition } from "@/components/atmosphere/book-portal-transition";
import { useTheme } from "@/components/theme/theme-provider";

type EntryPreference = "always" | "once-session" | "never";
export function EntryExperience() {
  const router = useRouter(); const { reduceMotion } = useTheme();
  const preference = typeof window === "undefined" ? "always" : (localStorage.getItem("arya-entry-animation") as EntryPreference | null) ?? "always";
  const alreadyShown = typeof window !== "undefined" && sessionStorage.getItem("arya-entry-shown") === "true";
  const shouldSkip = reduceMotion || preference === "never" || preference === "once-session" && alreadyShown;
  useEffect(() => { if (shouldSkip) router.replace("/dashboard"); }, [router, shouldSkip]);
  if (shouldSkip) return null;
  return <BookPortalTransition onComplete={() => { sessionStorage.setItem("arya-entry-shown", "true"); router.replace("/dashboard"); }} onSkip={() => { sessionStorage.setItem("arya-entry-shown", "true"); router.replace("/dashboard"); }} />;
}
