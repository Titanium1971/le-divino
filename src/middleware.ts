import createMiddleware from "next-intl/middleware";
import { NextRequest } from "next/server";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const acceptLanguage = request.headers.get("accept-language");

  // If no Accept-Language header or empty, force fr as default
  // by setting the header so next-intl picks it up
  if (!acceptLanguage || acceptLanguage.trim() === "" || acceptLanguage === "*") {
    request.headers.set("accept-language", "fr");
  } else {
    // Check if any supported locale is present in the header
    const supported = routing.locales as readonly string[];
    const hasSupported = supported.some((loc) =>
      acceptLanguage.toLowerCase().includes(loc)
    );
    if (!hasSupported) {
      // Unsupported language preference → default to fr
      request.headers.set("accept-language", "fr");
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!admin|api|ecran|service|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|xml|txt)$).*)",
  ],
};
