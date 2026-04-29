import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { MAINTENANCE_HTML } from "@/lib/maintenance-html";

const intlMiddleware = createMiddleware(routing);

const MAINTENANCE_BYPASS_PREFIXES = ["/admin", "/api", "/ecran", "/service"];

export default function middleware(req: NextRequest) {
  if (process.env.MAINTENANCE_MODE === "true") {
    return new NextResponse(MAINTENANCE_HTML, {
      status: 503,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Retry-After": "86400",
        "Cache-Control": "no-store, must-revalidate",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  }

  const path = req.nextUrl.pathname;
  if (MAINTENANCE_BYPASS_PREFIXES.some((p) => path.startsWith(p))) {
    return NextResponse.next();
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|xml|txt)$).*)",
  ],
};
