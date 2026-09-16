"use client";

import Link from "next/link";
import { ShieldCheck, UserRound, Activity, ArrowLeft } from "lucide-react";
import { useAuth } from "@/features/auth/auth-provider";
import { getAuthAuditLog } from "@/features/auth/local-auth";

export function AdminDashboard() {
  const { user } = useAuth();
  const auditLog = getAuthAuditLog();

  if (user?.role !== "admin") {
    return <section className="settings-surface mx-auto max-w-2xl p-8 text-center"><ShieldCheck className="mx-auto text-[var(--accent)]" size={34} /><h1 className="mt-4 font-serif text-3xl">Área restrita</h1><p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">Esta área está disponível somente para a conta administradora.</p><Link href="/dashboard" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--button-primary)] px-4 py-2 text-sm font-semibold text-white"><ArrowLeft size={16} />Voltar ao dashboard</Link></section>;
  }

  return <div className="space-y-7"><header><p className="flex items-center gap-2 text-sm font-semibold text-[var(--accent)]"><ShieldCheck size={17} />PAINEL ADMINISTRATIVO</p><h1 className="mt-2 font-serif text-4xl">Visão da casa</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">Acompanhe o perfil local e os acessos registrados neste navegador.</p></header><div className="grid gap-4 sm:grid-cols-3"><Stat icon={UserRound} label="Perfil atual" value={user.name} /><Stat icon={ShieldCheck} label="Nível" value="Administradora" /><Stat icon={Activity} label="Registros" value={String(auditLog.length)} /></div><section className="settings-surface p-6"><div className="flex items-center justify-between gap-4"><div><h2 className="font-serif text-2xl">Atividade de acesso</h2><p className="mt-1 text-sm text-[var(--text-secondary)]">Somente eventos locais, sem senhas ou dados sensíveis.</p></div><Activity className="text-[var(--accent)]" /></div>{auditLog.length ? <ul className="mt-6 divide-y divide-[var(--border)]">{auditLog.map((item) => <li key={item.id} className="flex items-center justify-between gap-4 py-4 text-sm"><span><strong className="block">{item.name}</strong><span className="text-[var(--text-secondary)]">{item.type === "login" ? "Entrou no AryaVerse" : "Saiu do AryaVerse"}</span></span><time className="shrink-0 text-xs text-[var(--text-muted)]">{new Date(item.createdAt).toLocaleString("pt-BR")}</time></li>)}</ul> : <p className="mt-6 rounded-2xl bg-[var(--surface-soft)] p-4 text-sm text-[var(--text-secondary)]">Os próximos acessos aparecerão aqui.</p>}</section></div>;
}

function Stat({ icon: Icon, label, value }: { icon: typeof UserRound; label: string; value: string }) { return <article className="settings-surface p-5"><Icon size={19} className="text-[var(--accent)]" /><p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{label}</p><strong className="mt-1 block truncate text-lg">{value}</strong></article>; }
