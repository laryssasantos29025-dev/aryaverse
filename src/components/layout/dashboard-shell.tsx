"use client";

import { type ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, BookOpen, ChevronDown, Droplets, FileText, LayoutDashboard, Settings } from "lucide-react";
import { FairyDust } from "@/components/atmosphere/fairy-dust";
import { AryaAssistantPlaceholder } from "@/components/arya/arya-assistant-placeholder";
import { InteractionFeedback } from "@/components/ui/interaction-feedback";
import { OfficialLogo } from "@/components/brand/official-logo";
import { chapterRepository } from "@/services/repositories/chapter-repository";
import { subjectRepository } from "@/services/repositories/subject-repository";
import { getSubject } from "@/features/experiences/subject-data";
import { useAuth } from "@/features/auth/auth-provider";
import { logoutLocalProfile } from "@/features/auth/local-auth";

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Biblioteca Viva", href: "/biblioteca", icon: BookOpen },
  { label: "Diários", href: "/diarios", icon: FileText },
  { label: "Jardim das Águas", href: "/jardim-das-aguas", icon: Droplets },
  { label: "Configurações", href: "/configuracoes", icon: Settings },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname(); const router = useRouter(); const { displayName } = useAuth(); const [signingOut, setSigningOut] = useState(false);
  const logout = () => { setSigningOut(true); logoutLocalProfile(); router.replace("/login"); router.refresh(); };
  const breadcrumb = getBreadcrumb(pathname);
  return <InteractionFeedback><div className="relative min-h-screen lg:flex"><FairyDust />
    <aside style={{ background: "#FFFFFF", borderColor: "rgba(20, 45, 65, 0.08)" }} className="brand-chrome water-sidebar relative z-20 flex shrink-0 flex-col border-b px-5 py-6 lg:min-h-screen lg:w-64 lg:border-r lg:border-b-0">
      <Link href="/dashboard" className="brand-home-link mb-8 block px-2" aria-label="Ir para o Dashboard"><OfficialLogo className="brand-header-logo block h-auto w-full max-w-52 object-contain" priority /></Link>
      <nav style={{ background: "#FFFFFF" }} className="brand-chrome arya-navigation flex gap-1 overflow-x-auto lg:block lg:space-y-1">{navigation.map(({ label, href, icon: Icon }) => { const active = pathname === href || href === "/biblioteca" && pathname.startsWith("/biblioteca/") || href === "/diarios" && pathname === "/diario"; return <Link key={href} href={href} className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${active ? "bg-[var(--accent-soft)] font-semibold text-[var(--accent-strong)]" : "text-[var(--text-secondary)] hover:bg-[var(--surface-soft)]"}`}><Icon size={18} strokeWidth={active ? 2.2 : 1.8} />{label}</Link>; })}</nav>
      <div className="mt-auto hidden lg:block"><Link href="/configuracoes" className="flex items-center gap-3 rounded-2xl bg-[var(--surface-soft)] p-3 text-left"><div className="grid size-9 place-items-center rounded-full bg-[var(--accent-soft)] font-semibold text-[var(--accent-strong)]">{displayName.slice(0, 1).toUpperCase()}</div><span className="flex-1 truncate text-sm font-medium">{displayName}</span><ChevronDown size={16} /></Link><button onClick={logout} disabled={signingOut} className="mt-2 w-full rounded-xl px-3 py-2 text-left text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-soft)]">{signingOut ? "Saindo..." : "Sair do AryaVerse"}</button></div>
    </aside>
    <div className="relative z-10 min-w-0 flex-1"><header style={{ background: "#FFFFFF", borderColor: "rgba(20, 45, 65, 0.08)" }} className="brand-chrome water-header flex h-20 items-center justify-between border-b px-6 lg:px-10"><nav aria-label="Caminho de navegação" className="flex min-w-0 items-center gap-2 overflow-x-auto text-sm text-[var(--text-secondary)]">{breadcrumb.map((item, index) => <span key={`${item.label}-${index}`} className="flex shrink-0 items-center gap-2">{index > 0 && <span aria-hidden="true">/</span>}{item.href ? <Link href={item.href} className="font-medium text-[var(--text-primary)] hover:text-[var(--accent-strong)]">{item.label}</Link> : <span aria-current="page" className="font-medium text-[var(--text-primary)]">{item.label}</span>}</span>)}</nav><button data-feedback="Nenhuma nova notificação por enquanto." aria-label="Notificações" className="relative grid size-10 place-items-center rounded-xl border border-[var(--border)] text-[var(--text-secondary)]"><Bell size={19} /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-[var(--glow)]" /></button></header><main className="arya-content-safe mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-10">{children}</main></div><AryaAssistantPlaceholder />
  </div></InteractionFeedback>;
}

function getBreadcrumb(pathname: string) {
  const chapterMatch = pathname.match(/^\/biblioteca\/([^/]+)\/capitulo\/([^/]+)$/);
  const subjectMatch = pathname.match(/^\/biblioteca\/([^/]+)$/);
  const subjectId = chapterMatch?.[1] ?? subjectMatch?.[1];
  if (subjectId) {
    const storedSubject = subjectRepository.list().find((subject) => subject.id === subjectId);
    const subjectName = storedSubject?.name ?? getSubject(subjectId)?.name ?? formatSlug(subjectId);
    const items: { label: string; href?: string }[] = [
      { label: "Biblioteca Viva", href: "/biblioteca" },
      { label: subjectName, href: `/biblioteca/${subjectId}` },
    ];
    if (chapterMatch) items.push({ label: chapterRepository.get(chapterMatch[2])?.title ?? "Capítulo" });
    else delete items[items.length - 1].href;
    return items;
  }
  const currentPage = navigation.find((item) => item.href === pathname)?.label ?? "AryaVerse";
  return [{ label: currentPage }];
}

function formatSlug(value: string) {
  return value.split("-").filter((part) => !/^\d+$/.test(part)).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}
