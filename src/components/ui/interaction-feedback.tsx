"use client";

import { createContext, useContext, useState } from "react";

type Feedback = (message: string) => void;
const FeedbackContext = createContext<Feedback>(() => undefined);
export function InteractionFeedback({ children }: { children: React.ReactNode }) { const [message, setMessage] = useState<string | null>(null); const notify: Feedback = (next) => { setMessage(next); window.setTimeout(() => setMessage(null), 2600); }; return <FeedbackContext.Provider value={notify}><div onClick={(event) => { const target = event.target as HTMLElement; const button = target.closest("button"); if (!button || button.dataset.silent === "true") return; notify(button.dataset.feedback ?? "Arya registrou este proximo passo."); }}>{children}</div>{message && <div className="arya-toast" role="status">{message}</div>}</FeedbackContext.Provider>; }
export function useInteractionFeedback() { return useContext(FeedbackContext); }
