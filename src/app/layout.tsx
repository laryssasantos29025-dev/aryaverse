import type { Metadata } from "next";
import Script from "next/script";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AuthProvider } from "@/features/auth/auth-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "AryaVerse | Seu universo de estudos",
  description: "Workspace inteligente para estudos com Arya.",
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
