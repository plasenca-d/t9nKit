/**
 * Next.js Middleware
 * middleware.ts (root of project)
 *
 * Handles:
 * - Language detection from Accept-Language header
 * - Redirects to correct language path
 * - Cookie-based language persistence
 */

import { NextRequest, NextResponse } from "next/server";
import { supportedLanguages, defaultLanguage } from "./i18n-config";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if pathname already has a language
  const pathnameHasLang = supportedLanguages.some(
    (lang) => pathname.startsWith(`/${lang}/`) || pathname === `/${lang}`,
  );

  if (pathnameHasLang) {
    return NextResponse.next();
  }

  // Get language from cookie or Accept-Language header
  const cookieLang = request.cookies.get("NEXT_LOCALE")?.value;
  const acceptLang = request.headers.get("accept-language");

  let detectedLang = defaultLanguage;

  // Priority: Cookie > Accept-Language > Default
  if (cookieLang && supportedLanguages.includes(cookieLang as any)) {
    detectedLang = cookieLang as any;
  } else if (acceptLang) {
    // Parse "en-US,en;q=0.9,es;q=0.8" -> ["en", "es"]
    const languages = acceptLang
      .split(",")
      .map((lang) => lang.split(";")[0].split("-")[0].trim())
      .filter((lang) => supportedLanguages.includes(lang as any));

    if (languages.length > 0) {
      detectedLang = languages[0] as any;
    }
  }

  // Redirect to language path
  const url = request.nextUrl.clone();
  url.pathname = `/${detectedLang}${pathname}`;

  const response = NextResponse.redirect(url);

  // Set cookie to remember language preference
  response.cookies.set("NEXT_LOCALE", detectedLang, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });

  return response;
}

export const config = {
  // Match all paths except:
  // - api routes
  // - _next (Next.js internals)
  // - static files
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
