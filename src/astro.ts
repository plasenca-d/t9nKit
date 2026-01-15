/**
 * Astro Utilities
 * Enhanced helpers for Astro framework integration
 * Maintains backward compatibility with original API
 *
 * @module t9nkit/astro
 */

import { createTranslator } from "./core";
import type { T9nKitConfig, LanguageCode } from "./core";

/**
 * Extract language from URL pathname
 * Compatible with Astro routing patterns
 *
 * Supports patterns:
 * - /es/page → 'es'
 * - /en/blog/post → 'en'
 * - /page → defaultLang (no prefix)
 *
 * @example Basic usage
 * ```astro
 * ---
 * import { getLangFromUrl } from 't9nkit/astro';
 * const lang = getLangFromUrl(Astro.url, ['es', 'en'], 'es');
 * ---
 * ```
 *
 * @example With Astro.currentLocale (Astro 4+)
 * ```astro
 * ---
 * import { getLangFromUrl } from 't9nkit/astro';
 * // Astro.currentLocale is available in Astro 4+
 * const lang = Astro.currentLocale || getLangFromUrl(Astro.url, ['es', 'en'], 'es');
 * ---
 * ```
 */
export function getLangFromUrl<T extends LanguageCode = string>(
  url: URL,
  supportedLanguages: T[],
  defaultLang: T,
): T {
  const [, lang] = url.pathname.split("/");
  if (supportedLanguages.includes(lang as T)) {
    return lang as T;
  }
  return defaultLang;
}

/**
 * Create translations hook for Astro components
 * Drop-in replacement for original useTranslations
 *
 * @example Astro component
 * ```astro
 * ---
 * import { useTranslations } from 't9nkit/astro';
 * import { t9nConfig } from '~/i18n/config';
 *
 * const { t, tn, td } = useTranslations(t9nConfig, 'es');
 * ---
 * <h1>{t('nav.home')}</h1>
 * <p>{tn(1234.56)}</p>
 * ```
 *
 * @example React/Preact component (client-side)
 * ```tsx
 * import { useTranslations } from 't9nkit/astro';
 * import { t9nConfig } from '~/i18n/config';
 *
 * export default function Component() {
 *   const { t } = useTranslations(t9nConfig, 'es');
 *   return <h1>{t('nav.home')}</h1>;
 * }
 * ```
 *
 * @example With getLangFromUrl
 * ```astro
 * ---
 * import { useTranslations, getLangFromUrl } from 't9nkit/astro';
 * import { t9nConfig } from '~/i18n/config';
 *
 * const lang = getLangFromUrl(Astro.url, ['es', 'en'], 'es');
 * const { t, tn } = useTranslations(t9nConfig, lang);
 * ---
 * ```
 */
export function useTranslations<T extends LanguageCode = string>(
  config: T9nKitConfig<T>,
  lang: T,
): ReturnType<typeof createTranslator<T>> {
  return createTranslator(config, lang);
}

/**
 * Get simple translation without interpolation
 * Useful for metadata, SEO, and other non-interpolated strings
 *
 * @example
 * ```astro
 * ---
 * import { getTranslation } from 't9nkit/astro';
 * import { t9nConfig } from '~/i18n/config';
 *
 * const title = getTranslation('meta.title', t9nConfig, 'es');
 * ---
 * <title>{title}</title>
 * ```
 */
export function getTranslation<T extends LanguageCode = string>(
  key: string,
  config: T9nKitConfig<T>,
  lang?: T,
): string {
  const { getTranslation } = createTranslator(config, lang);
  return getTranslation(key);
}

/**
 * Check if translation exists
 * Useful for conditional rendering
 *
 * @example
 * ```astro
 * ---
 * import { hasTranslation, useTranslations } from 't9nkit/astro';
 * import { t9nConfig } from '~/i18n/config';
 *
 * const { t } = useTranslations(t9nConfig, 'es');
 * const hasDescription = hasTranslation('product.description', t9nConfig, 'es');
 * ---
 * {hasDescription && <p>{t('product.description')}</p>}
 * ```
 */
export function hasTranslation<T extends LanguageCode = string>(
  key: string,
  config: T9nKitConfig<T>,
  lang?: T,
): boolean {
  const { hasTranslation } = createTranslator(config, lang);
  return hasTranslation(key);
}

/**
 * Generate alternate language links for SEO
 * Useful for <link rel="alternate" hreflang="...">
 *
 * @example
 * ```astro
 * ---
 * import { generateAlternateLinks } from 't9nkit/astro';
 *
 * const alternates = generateAlternateLinks(
 *   Astro.url,
 *   ['es', 'en'],
 *   'es'
 * );
 * ---
 * <head>
 *   {alternates.map(({ lang, url }) => (
 *     <link rel="alternate" hreflang={lang} href={url} />
 *   ))}
 * </head>
 * ```
 */
export function generateAlternateLinks<T extends LanguageCode = string>(
  currentUrl: URL,
  languages: T[],
  defaultLang: T,
): Array<{ lang: T; url: string }> {
  const [, currentLang, ...pathParts] = currentUrl.pathname.split("/");
  const isLangInPath = languages.includes(currentLang as T);

  const basePath = isLangInPath
    ? `/${pathParts.join("/")}`
    : currentUrl.pathname;

  return languages.map((lang) => ({
    lang,
    url:
      lang === defaultLang
        ? `${currentUrl.origin}${basePath}${currentUrl.search}`
        : `${currentUrl.origin}/${lang}${basePath}${currentUrl.search}`,
  }));
}

/**
 * Create language switcher data for UI
 * Returns current language and available alternatives
 *
 * @example
 * ```astro
 * ---
 * import { createLanguageSwitcher } from 't9nkit/astro';
 * import { t9nConfig } from '~/i18n/config';
 *
 * const switcher = createLanguageSwitcher(
 *   Astro.url,
 *   ['es', 'en'],
 *   'es',
 *   t9nConfig.languages
 * );
 * ---
 * <nav>
 *   <span>Current: {switcher.current.name}</span>
 *   {switcher.alternatives.map(({ code, name, url }) => (
 *     <a href={url}>{name}</a>
 *   ))}
 * </nav>
 * ```
 */
export function createLanguageSwitcher<T extends LanguageCode = string>(
  currentUrl: URL,
  languages: T[],
  defaultLang: T,
  languageNames?: Record<T, string>,
): {
  current: { code: T; name: string };
  alternatives: Array<{ code: T; name: string; url: string }>;
} {
  const currentLang = getLangFromUrl(currentUrl, languages, defaultLang);
  const alternates = generateAlternateLinks(currentUrl, languages, defaultLang);

  return {
    current: {
      code: currentLang as T,
      name: (languageNames?.[currentLang] || currentLang) as string,
    },
    alternatives: alternates
      .filter((alt) => alt.lang !== currentLang)
      .map((alt) => ({
        code: alt.lang as T,
        name: (languageNames?.[alt.lang] || alt.lang) as string,
        url: alt.url,
      })),
  };
}
