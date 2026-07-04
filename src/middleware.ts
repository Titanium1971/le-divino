import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

// Locales locked behind the I18N kill-switch (site FR-only when disabled).
const LOCKED_LOCALES = ["en", "it", "es", "de"];

export default function middleware(request: NextRequest) {
  if (process.env.MAINTENANCE_MODE === "true") {
    const { pathname } = request.nextUrl;
    const isStatic =
      pathname.startsWith("/_next") ||
      pathname.startsWith("/favicon") ||
      /\.(?:svg|png|jpg|jpeg|gif|webp|ico|xml|txt)$/.test(pathname);

    if (isStatic) {
      return NextResponse.next();
    }
    if (pathname !== "/maintenance") {
      return NextResponse.redirect(new URL("/maintenance", request.url));
    }
    // On /maintenance: serve directly, skip next-intl locale handling.
    return NextResponse.next();
  }

  // Kill-switch: when i18n is disabled (unpaid invoice), the site is FR-only.
  // Redirect any localized URL (/en/*, /it/*, /es/*, /de/*) to its /fr equivalent
  // (as-needed prefix → FR has no prefix, so we just strip the locale segment).
  // Re-enable by setting I18N_ENABLED="true" on Vercel.
  if (process.env.I18N_ENABLED !== "true") {
    const { pathname } = request.nextUrl;
    const seg = pathname.split("/")[1];
    if (LOCKED_LOCALES.includes(seg)) {
      const rest = pathname.slice(seg.length + 1) || "/";
      const url = new URL(rest, request.url);
      url.search = request.nextUrl.search;
      return NextResponse.redirect(url, 307);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!admin|api|ecran|service|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|xml|txt)$).*)",
  ],
};
