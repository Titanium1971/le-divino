import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { createServerClient } from "@supabase/ssr";

const handleI18nRouting = createIntlMiddleware(routing);

function createSupabaseMiddlewareClient(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  return { supabase, response: () => response };
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin routes: auth gate ──
  if (pathname.startsWith("/admin")) {
    const { supabase, response } = createSupabaseMiddlewareClient(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Not authenticated → redirect to login (unless already on login page)
    if (!user && pathname !== "/admin/login") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }

    // Already authenticated → redirect away from login page
    if (user && pathname === "/admin/login") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }

    return response();
  }

  // ── Ecran & API: no i18n, no auth ──
  if (pathname.startsWith("/ecran") || pathname.startsWith("/service") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // ── Public routes: Supabase session refresh + i18n ──
  const { supabase, response: supabaseResponse } = createSupabaseMiddlewareClient(request);
  await supabase.auth.getUser();

  const i18nResponse = handleI18nRouting(request);

  supabaseResponse()
    .cookies.getAll()
    .forEach((cookie) => {
      i18nResponse.cookies.set(cookie.name, cookie.value);
    });

  return i18nResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
