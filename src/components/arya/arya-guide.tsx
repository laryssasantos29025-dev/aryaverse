"use client";

import { useEffect, useRef, useState } from "react";
import { Minimize2, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";
import { subjectRepository } from "@/services/repositories/subject-repository";
import { AryaCharacter } from "./arya-character";
import { aryaAnnouncement, type AryaAnnouncement, type AryaState, type AryaVisualPreference } from "./arya-state";

const idleMessage = "Estou aqui quando você quiser continuar.";

export function AryaGuide() {
  const pathname = usePathname();
  const [libraryIsEmpty] = useState(() => !subjectRepository.list().length);
  const [state, setState] = useState<AryaState>(() => libraryIsEmpty ? "welcome" : "idle");
  const [message, setMessage] = useState<string | undefined>(() => libraryIsEmpty ? aryaAnnouncement("EMPTY_LIBRARY").message : undefined);
  const [minimized, setMinimized] = useState(false);
  const [quiet, setQuiet] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const clearTimer = useRef<number | undefined>(undefined);
  const shownMessages = useRef(new Map<string, number>());
  const isStudy = pathname.includes("/capitulo/");
  const context = quiet ? "quiz" : focusMode ? "focus" : isStudy ? "study" : "dashboard";

  function apply(next: AryaAnnouncement) {
    if (clearTimer.current) window.clearTimeout(clearTimer.current);
    const lastShown = next.message ? shownMessages.current.get(next.message) ?? 0 : 0;
    const shouldShow = Boolean(next.message) && Date.now() - lastShown > 7000;
    setState(next.state); setMessage(shouldShow ? next.message : undefined);
    if (shouldShow && next.message) shownMessages.current.set(next.message, Date.now());
    if (next.duration && shouldShow) clearTimer.current = window.setTimeout(() => { setState("idle"); setMessage(undefined); }, next.duration);
  }

  function minimize() { setMinimized(true); window.localStorage.setItem("arya-ui-minimized", "true"); }
  function restore() { setMinimized(false); window.localStorage.setItem("arya-ui-minimized", "false"); }

  useEffect(() => {
    const saved = window.localStorage.getItem("arya-ui-minimized") === "true";
    if (saved) window.setTimeout(() => setMinimized(true), 0);
    const listener = (event: Event) => apply((event as CustomEvent<AryaAnnouncement>).detail);
    const visualListener = (event: Event) => { const detail = (event as CustomEvent<AryaVisualPreference>).detail; setQuiet(Boolean(detail.quiet)); setFocusMode(Boolean(detail.focus)); };
    window.addEventListener("arya:state", listener);
    window.addEventListener("arya:visual-preference", visualListener);
    return () => { window.removeEventListener("arya:state", listener); window.removeEventListener("arya:visual-preference", visualListener); if (clearTimer.current) window.clearTimeout(clearTimer.current); };
  }, []);

  return <aside className={`arya-guide arya-guide-${state} arya-guide-${context} ${minimized ? "arya-guide-minimized" : ""}`} aria-label="Arya, sua guia de estudos">
    {message && !quiet && !focusMode && <div className="arya-message" role="status"><Sparkles size={14} /><span>{message}</span><button type="button" onClick={() => setMessage(undefined)} aria-label="Fechar mensagem da Arya">×</button></div>}
    {!minimized && <button type="button" className="arya-minimize" onClick={minimize} aria-label="Minimizar Arya"><Minimize2 size={14} /></button>}
    <button type="button" className="arya-avatar" onClick={() => minimized ? restore() : setMessage((current) => current ? undefined : idleMessage)} aria-label={minimized ? "Expandir Arya" : "Abrir mensagem da Arya"}><AryaCharacter state={state} size={context === "dashboard" ? "large" : "medium"} /></button>
  </aside>;
}
