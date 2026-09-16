import { ArrowRight, Sparkles } from "lucide-react";

export function EmptyState({ message, action, onAction, title = "Um espaço esperando por você" }: { message: string; action: string; onAction: () => void; title?: string }) { return <div className="empty-state"><span className="empty-state-icon"><Sparkles size={23} /></span><h2>{title}</h2><p>{message}</p><button onClick={onAction} className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--button-primary)] px-4 py-2 text-sm font-semibold text-white">{action}<ArrowRight size={15} /></button></div>; }
