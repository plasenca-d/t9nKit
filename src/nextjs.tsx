/**
 * Next.js Utilities for t9nKit
 *
 * Supports both App Router (Next.js 13+) and Pages Router
 * Handles Server Components, Client Components, and Middleware
 *
 * @module t9nkit/nextjs
 */

"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { T9nKit, type T9nKitConfig, type LanguageCode } from "./core";

/**
 * Translation context for Next.js
 */
interface NextTranslationContextType<T extends LanguageCode = string> {
  language: T;
  t: (key: string, params?: any) => string;
  tn: (value: number, options?: Intl.NumberFormatOptions) => string;
  td: (
    date: Date | string | number,
    options?: Intl.DateTimeFormatOptions,
  ) => string;
  tc: (value: number, currency?: string) => string;
  tr: (value: number, unit: Intl.RelativeTimeFormatUnit) => string;
  hasTranslation: (key: string) => boolean;
  getTranslation: (key: string) => string;
}

const NextTranslationContext = createContext<NextTranslationContextType | null>(
  null,
);

/**
 * Next.js Translation Provider
 *
 * For App Router: Use in layout.tsx (Server Component passes language)
 * For Pages Router: Use in _app.tsx with router.locale
 *
 * @example App Router (app/[lang]/layout.tsx)
 * ```tsx
 * import { NextTranslationProvider } from 't9nkit/nextjs';
 * import { i18nConfig } from '@/i18n/config';
 *
 * export default function Layout({
 *   children,
 *   params
 * }: {
 *   children: ReactNode;
 *   params: { lang: string }
 * }) {
 *   return (
 *     <NextTranslationProvider config={i18nConfig} language={params.lang}>
 *       {children}
 *     </NextTranslationProvider>
 *   );
 * }
 * ```
 *
 * @example Pages Router (_app.tsx)
 * ```tsx
 * import { NextTranslationProvider } from 't9nkit/nextjs';
 * import { i18nConfig } from '@/i18n/config';
 * import { useRouter } from 'next/router';
 *
 * export default function App({ Component, pageProps }) {
 *   const router = useRouter();
 *
 *   return (
 *     <NextTranslationProvider config={i18nConfig} language={router.locale}>
 *       <Component {...pageProps} />
 *     </NextTranslationProvider>
 *   );
 * }
 * ```
 */
export function NextTranslationProvider<T extends LanguageCode = string>({
  children,
  config,
  language,
}: {
  children: ReactNode;
  config: T9nKitConfig<T>;
  language: T;
}): React.ReactElement {
  const kit = useMemo(() => {
    const instance = new T9nKit(config);
    instance.setLanguage(language);
    return instance;
  }, [config, language]);

  const value = useMemo(
    () => ({
      language,
      t: (key: string, params?: any): string => kit.translate(key, params),
      tn: (value: number, options?: Intl.NumberFormatOptions): string =>
        kit.formatNumber(value, options),
      td: (
        date: Date | string | number,
        options?: Intl.DateTimeFormatOptions,
      ): string => kit.formatDate(date, options),
      tc: (value: number, currency?: string): string =>
        kit.formatCurrency(value, currency),
      tr: (value: number, unit: Intl.RelativeTimeFormatUnit): string =>
        kit.formatRelativeTime(value, unit),
      hasTranslation: (key: string): boolean => kit.hasTranslation(key),
      getTranslation: (key: string): string => kit.getTranslation(key),
    }),
    [kit, language],
  );

  return (
    <NextTranslationContext.Provider value={value}>
      {children}
    </NextTranslationContext.Provider>
  );
}

/**
 * Hook to use translations in Next.js Client Components
 *
 * Must be used within NextTranslationProvider
 * Only works in Client Components ('use client')
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { useNextTranslation } from 't9nkit/nextjs';
 *
 * export default function ClientComponent() {
 *   const { t, language } = useNextTranslation();
 *
 *   return (
 *     <div>
 *       <h1>{t('welcome')}</h1>
 *       <p>Current language: {language}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useNextTranslation<T extends LanguageCode = string>() {
  const context = useContext(NextTranslationContext);

  if (!context) {
    throw new Error(
      "useNextTranslation must be used within a NextTranslationProvider. " +
        "Make sure your layout.tsx or _app.tsx wraps children with <NextTranslationProvider>.",
    );
  }

  return context as NextTranslationContextType<T>;
}

/**
 * Create translator for Server Components
 *
 * Server Components can't use hooks or context.
 * Use this function to create a translator in Server Components.
 *
 * @example App Router Server Component
 * ```tsx
 * import { createServerTranslator } from 't9nkit/nextjs';
 * import { i18nConfig } from '@/i18n/config';
 *
 * export default async function ServerComponent({
 *   params
 * }: {
 *   params: { lang: string }
 * }) {
 *   const { t, td } = createServerTranslator(i18nConfig, params.lang);
 *
 *   return (
 *     <div>
 *       <h1>{t('server.title')}</h1>
 *       <time>{td(new Date())}</time>
 *     </div>
 *   );
 * }
 * ```
 */
export function createServerTranslator<T extends LanguageCode = string>(
  config: T9nKitConfig<T>,
  language: T,
): {
  language: T;
  t: (key: string, params?: any) => string;
  tn: (value: number, options?: Intl.NumberFormatOptions) => string;
  td: (
    date: Date | string | number,
    options?: Intl.DateTimeFormatOptions,
  ) => string;
  tc: (value: number, currency?: string) => string;
  tr: (value: number, unit: Intl.RelativeTimeFormatUnit) => string;
  hasTranslation: (key: string) => boolean;
  getTranslation: (key: string) => string;
} {
  const kit = new T9nKit(config);
  kit.setLanguage(language);

  return {
    language: language as T,
    t: (key: string, params?: any): string => kit.translate(key, params),
    tn: (value: number, options?: Intl.NumberFormatOptions): string =>
      kit.formatNumber(value, options),
    td: (
      date: Date | string | number,
      options?: Intl.DateTimeFormatOptions,
    ): string => kit.formatDate(date, options),
    tc: (value: number, currency?: string): string =>
      kit.formatCurrency(value, currency),
    tr: (value: number, unit: Intl.RelativeTimeFormatUnit): string =>
      kit.formatRelativeTime(value, unit),
    hasTranslation: (key: string): boolean => kit.hasTranslation(key),
    getTranslation: (key: string): string => kit.getTranslation(key),
  };
}

/**
 * Get language from Next.js request headers
 * Useful in middleware or API routes
 *
 * @example Middleware
 * ```typescript
 * import { NextRequest, NextResponse } from 'next/server';
 * import { getLanguageFromRequest } from 't9nkit/nextjs';
 *
 * export function middleware(request: NextRequest) {
 *   const lang = getLanguageFromRequest(
 *     request,
 *     ['es', 'en'],
 *     'es'
 *   );
 *
 *   // Redirect if no language in path
 *   if (!request.nextUrl.pathname.startsWith(`/${lang}`)) {
 *     return NextResponse.redirect(
 *       new URL(`/${lang}${request.nextUrl.pathname}`, request.url)
 *     );
 *   }
 *
 *   return NextResponse.next();
 * }
 * ```
 */
export function getLanguageFromRequest<T extends LanguageCode = string>(
  request: Request,
  supportedLanguages: T[],
  defaultLanguage: T,
): T {
  const acceptLanguage = request.headers.get("accept-language");

  if (acceptLanguage) {
    // Parse "en-US,en;q=0.9,es;q=0.8" -> ["en", "es"]
    const languages = acceptLanguage
      .split(",")
      .map((lang) => lang.split(";")[0]?.split("-")[0]?.trim())
      .filter((lang) => supportedLanguages.includes(lang as T));

    if (languages.length > 0) {
      return languages[0] as T;
    }
  }

  return defaultLanguage;
}

/**
 * Generate language alternates for SEO
 * Use in metadata or head
 *
 * @example
 * ```tsx
 * import { generateLanguageAlternates } from 't9nkit/nextjs';
 *
 * export async function generateMetadata({ params }) {
 *   const alternates = generateLanguageAlternates(
 *     params.lang,
 *     ['es', 'en'],
 *     'https://myapp.com',
 *     '/about'
 *   );
 *
 *   return {
 *     alternates: {
 *       languages: alternates
 *     }
 *   };
 * }
 * ```
 */
export function generateLanguageAlternates<T extends LanguageCode = string>(
  currentLang: T,
  supportedLanguages: T[],
  baseUrl: string,
  pathname: string = "/",
): Record<string, string> {
  const alternates: Record<string, string> = {};

  supportedLanguages.forEach((lang) => {
    // Remove current language from path if it exists
    const cleanPath = pathname.replace(new RegExp(`^/${currentLang}`), "");
    alternates[lang] = `${baseUrl}/${lang}${cleanPath}`;
  });

  return alternates;
}
