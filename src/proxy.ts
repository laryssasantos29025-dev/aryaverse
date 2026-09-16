import { NextResponse, type NextRequest } from "next/server";

const publicRoutes = ["/login", "/cadastro"];
const protectedRoutes = ["/dashboard", "/biblioteca", "/diarios", "/diario", "/jardim-das-aguas", "/configuracoes", "/entrada"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.get("arya-local-session")?.value === "active";
  const needsProtection = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  if (!hasSession && needsProtection) return NextResponse.redirect(new URL("/login", request.url));
  if (hasSession && publicRoutes.includes(pathname)) return NextResponse.redirect(new URL("/dashboard", request.url));
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*", "/biblioteca/:path*", "/diarios/:path*", "/diario/:path*", "/jardim-das-aguas/:path*", "/configuracoes/:path*", "/entrada", "/login", "/cadastro"] };
