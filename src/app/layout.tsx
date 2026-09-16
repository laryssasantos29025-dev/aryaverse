import type { Metadata } from "next";
import Script from "next/script";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AuthProvider } from "@/features/auth/auth-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "AryaVerse | Seu universo de estudos",
  description: "Workspace inteligente para estudos com Arya.",
  metadataBase: new URL("https://aryaverso.netlify.app"),
  icons: { icon: "/brand/aryaverse-official-logo-transparent.png", apple: "/brand/aryaverse-official-logo.png" },
  openGraph: { title: "AryaVerse | Seu universo de estudos", description: "Um espaço vivo para organizar matérias, revisões e descobertas.", type: "website", locale: "pt_BR", images: [{ url: "/brand/aryaverse-official-logo.png", width: 1200, height: 630, alt: "AryaVerse" }] },
  twitter: { card: "summary_large_image", title: "AryaVerse | Seu universo de estudos", description: "Um espaço vivo para organizar matérias, revisões e descobertas.", images: ["/brand/aryaverse-official-logo.png"] },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" data-theme="enchanted-water" suppressHydrationWarning>
      <head>
        <Script id="arya-theme-bootstrap" strategy="beforeInteractive">{`try { const theme = localStorage.getItem("arya-theme"); if (theme) document.documentElement.dataset.theme = theme; } catch {}`}</Script>
      </head>
      <body><ThemeProvider><AuthProvider>{children}</AuthProvider></ThemeProvider></body>
    </html>
  );
}
