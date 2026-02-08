/**
 * Browser language detection utilities
 * SSR-safe — all functions check for browser globals before accessing them
 */

import type { LanguageCode } from "./types";

/**
 * Options for detecting the user's preferred language
 */
export interface DetectLanguageOptions<T extends LanguageCode = string> {
  /**
   * Languages supported by your app
   */
  supportedLanguages: T[];

  /**
   * Fallback language if none detected
   */
  defaultLanguage: T;

  /**
   * Detection sources in priority order
   * @default ['pathname', 'querystring', 'localStorage', 'cookie', 'navigator', 'htmlLang']
   */
  sources?: Array<
    | "navigator"
    | "htmlLang"
    | "localStorage"
    | "cookie"
    | "querystring"
    | "pathname"
  >;

  /**
   * localStorage key to read/write
   * @default "t9nkit-lang"
   */
  localStorageKey?: string;

  /**
   * Cookie name to read
   * @default "t9nkit-lang"
   */
  cookieName?: string;

  /**
   * Query parameter name (e.g. ?lang=es)
   * @default "lang"
   */
  queryParam?: string;
}

/**
 * Options for persisting language preference
 */
export interface PersistLanguageOptions {
  /**
   * Save to localStorage
   * @default true
   */
  localStorage?: boolean;

  /**
   * Save to cookie
   * @default false
   */
  cookie?: boolean;

  /**
   * localStorage key
   * @default "t9nkit-lang"
   */
  localStorageKey?: string;

  /**
   * Cookie name
   * @default "t9nkit-lang"
   */
  cookieName?: string;

  /**
   * Cookie max age in days
   * @default 365
   */
  cookieMaxAge?: number;
}

/**
 * Match a locale string against supported languages
 *
 * Resolution order:
 * 1. Exact match (case-insensitive)
 * 2. Base language match: "en-US" -> "en"
 * 3. Prefix match: "en" -> "en-US" (first supported that starts with the locale)
 *
 * @returns The matched language or null
 */
export function matchLanguage<T extends LanguageCode = string>(
  locale: string,
  supportedLanguages: T[],
): T | null {
  const lower = locale.toLowerCase();

  // 1. Exact match (case-insensitive)
  const exact = supportedLanguages.find((l) => l.toLowerCase() === lower);
  if (exact) return exact;

  // 2. Base language: "en-US" -> "en"
  const base = lower.split("-")[0];
  if (base && base !== lower) {
    const baseMatch = supportedLanguages.find((l) => l.toLowerCase() === base);
    if (baseMatch) return baseMatch;
  }

  // 3. Prefix match: "en" -> "en-US"
  const prefixMatch = supportedLanguages.find((l) =>
    l.toLowerCase().startsWith(lower + "-"),
  );
  if (prefixMatch) return prefixMatch;

  return null;
}

// ─── Source detectors ────────────────────────────────────────────────────────

function fromNavigator<T extends LanguageCode>(supported: T[]): T | null {
  if (typeof globalThis.navigator === "undefined") return null;

  const nav = globalThis.navigator;
  const languages = nav.languages ?? (nav.language ? [nav.language] : []);

  for (const locale of languages) {
    const match = matchLanguage(locale, supported);
    if (match) return match;
  }

  return null;
}

function fromHtmlLang<T extends LanguageCode>(supported: T[]): T | null {
  if (typeof globalThis.document === "undefined") return null;

  const lang = globalThis.document.documentElement?.lang;
  if (!lang) return null;

  return matchLanguage(lang, supported);
}

function fromLocalStorage<T extends LanguageCode>(
  supported: T[],
  key: string,
): T | null {
  if (typeof globalThis.localStorage === "undefined") return null;

  try {
    const stored = globalThis.localStorage.getItem(key);
    if (!stored) return null;
    return matchLanguage(stored, supported);
  } catch {
    return null;
  }
}

function fromCookie<T extends LanguageCode>(
  supported: T[],
  name: string,
): T | null {
  if (typeof globalThis.document === "undefined") return null;

  try {
    const cookies = globalThis.document.cookie;
    if (!cookies) return null;

    const match = cookies
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(name + "="));

    if (!match) return null;

    const value = match.split("=")[1];
    if (!value) return null;

    return matchLanguage(decodeURIComponent(value), supported);
  } catch {
    return null;
  }
}

function fromPathname<T extends LanguageCode>(supported: T[]): T | null {
  if (typeof globalThis.location === "undefined") return null;

  try {
    const pathname = new URL(globalThis.location.href).pathname;
    // Extract first segment: "/es/about" -> "es", "/en" -> "en"
    const firstSegment = pathname.split("/")[1];
    if (!firstSegment) return null;
    return matchLanguage(firstSegment, supported);
  } catch {
    return null;
  }
}

function fromQuerystring<T extends LanguageCode>(
  supported: T[],
  param: string,
): T | null {
  if (typeof globalThis.location === "undefined") return null;

  try {
    const url = new URL(globalThis.location.href);
    const value = url.searchParams.get(param);
    if (!value) return null;
    return matchLanguage(value, supported);
  } catch {
    return null;
  }
}

// ─── Main API ────────────────────────────────────────────────────────────────

const SOURCE_DETECTORS = {
  navigator: fromNavigator,
  htmlLang: fromHtmlLang,
  localStorage: fromLocalStorage,
  cookie: fromCookie,
  querystring: fromQuerystring,
  pathname: fromPathname,
} as const;

const DEFAULT_SOURCES: Array<keyof typeof SOURCE_DETECTORS> = [
  "pathname",
  "querystring",
  "localStorage",
  "cookie",
  "navigator",
  "htmlLang",
];

/**
 * Detect the user's preferred language from browser sources
 *
 * @example
 * ```ts
 * const lang = detectLanguage({
 *   supportedLanguages: ['en', 'es', 'fr'],
 *   defaultLanguage: 'en',
 * });
 * ```
 */
export function detectLanguage<T extends LanguageCode = string>(
  options: DetectLanguageOptions<T>,
): T {
  const {
    supportedLanguages,
    defaultLanguage,
    sources = DEFAULT_SOURCES,
    localStorageKey = "t9nkit-lang",
    cookieName = "t9nkit-lang",
    queryParam = "lang",
  } = options;

  for (const source of sources) {
    let result: T | null = null;

    switch (source) {
      case "navigator":
        result = fromNavigator(supportedLanguages);
        break;
      case "htmlLang":
        result = fromHtmlLang(supportedLanguages);
        break;
      case "localStorage":
        result = fromLocalStorage(supportedLanguages, localStorageKey);
        break;
      case "cookie":
        result = fromCookie(supportedLanguages, cookieName);
        break;
      case "querystring":
        result = fromQuerystring(supportedLanguages, queryParam);
        break;
      case "pathname":
        result = fromPathname(supportedLanguages);
        break;
    }

    if (result) return result;
  }

  return defaultLanguage;
}

/**
 * Persist the user's language preference
 *
 * @example
 * ```ts
 * persistLanguage('es');
 * persistLanguage('es', { cookie: true, localStorage: true });
 * ```
 */
export function persistLanguage(
  language: string,
  options: PersistLanguageOptions = {},
): void {
  const {
    localStorage: useLocalStorage = true,
    cookie: useCookie = false,
    localStorageKey = "t9nkit-lang",
    cookieName = "t9nkit-lang",
    cookieMaxAge = 365,
  } = options;

  if (useLocalStorage && typeof globalThis.localStorage !== "undefined") {
    try {
      globalThis.localStorage.setItem(localStorageKey, language);
    } catch {
      // Ignore storage errors (quota exceeded, private browsing, etc.)
    }
  }

  if (useCookie && typeof globalThis.document !== "undefined") {
    try {
      const maxAge = cookieMaxAge * 24 * 60 * 60;
      globalThis.document.cookie = `${cookieName}=${encodeURIComponent(language)};max-age=${maxAge};path=/;SameSite=Lax`;
    } catch {
      // Ignore cookie errors
    }
  }
}
