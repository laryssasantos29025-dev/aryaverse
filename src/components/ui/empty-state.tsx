import { Sparkles } from "lucide-react";

export function EmptyState({ message, action, onAction }: { message: string; action: string; onAction: () => void }) { return <div className="empty-state"><Sparkles size={23} /><p>{message}</p><button onClick={onAction} className="mt-4 rounded-full bg-[var(--button-primary)] px-4 py-2 text-sm font-semibold text-white">{action}</button></div>; }
