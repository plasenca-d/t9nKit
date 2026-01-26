/**
 * Next.js Client Utilities for t9nKit
 *
 * Client Components: Provider, Hook, and Context
 * Requires "use client" - uses React Context and hooks
 *
 * @module t9nkit/nextjs/client
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
 * import { NextTranslationProvider } from 't9nkit/nextjs/client';
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
 * import { NextTranslationProvider } from 't9nkit/nextjs/client';
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
 * import { useNextTranslation } from 't9nkit/nextjs/client';
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
