/**
 * Next.js Middleware
 * middleware.ts (root of project)
 *
 * Language detection from cookies / Accept-Language header.
 * Redirects to the correct language path and persists preference.
 */

import { NextRequest, NextResponse } from "next/server";
import { supportedLanguages, defaultLanguage } from "./i18n-config";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const pathnameHasLang = supportedLanguages.some(
    (lang) => pathname.startsWith(`/${lang}/`) || pathname === `/${lang}`,
  );

  if (pathnameHasLang) {
    return NextResponse.next();
  }

  // Priority: Cookie > Accept-Language > Default
  const cookieLang = request.cookies.get("NEXT_LOCALE")?.value;
  const acceptLang = request.headers.get("accept-language");

  let detectedLang = defaultLanguage;

  if (cookieLang && supportedLanguages.includes(cookieLang as any)) {
    detectedLang = cookieLang as any;
  } else if (acceptLang) {
    const languages = acceptLang
      .split(",")
      .map((lang) => lang.split(";")[0].split("-")[0].trim())
      .filter((lang) => supportedLanguages.includes(lang as any));

    if (languages.length > 0) {
      detectedLang = languages[0] as any;
    }
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${detectedLang}${pathname}`;

  const response = NextResponse.redirect(url);
  response.cookies.set("NEXT_LOCALE", detectedLang, {
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
