/**
 * Centralized i18n Configuration for Astro
 * 
 * This file creates a singleton instance that you import everywhere.
 * No need to pass config or language on every component!
 */

import { T9nKit, type T9nKitConfig } from '../../src/core';

// ====================================
// 1. Define your language type
// ====================================
export type AppLanguage = 'es' | 'en';

// ====================================
// 2. Your translations
// ====================================
export const translations = {
  es: {
    nav: {
      home: "Inicio",
      about: "Acerca de",
      contact: "Contacto",
    },
    common: {
      loading: "Cargando...",
      error: "Error",
    },
    hero: {
      title: "Bienvenido",
      subtitle: "Sistema de traducción completo",
    },
  },
  en: {
    nav: {
      home: "Home",
      about: "About",
      contact: "Contact",
    },
    common: {
      loading: "Loading...",
      error: "Error",
    },
    hero: {
      title: "Welcome",
      subtitle: "Complete translation system",
    },
  },
} as const;

// ====================================
// 3. Configuration
// ====================================
export const i18nConfig: T9nKitConfig<AppLanguage> = {
  translations,
  defaultLanguage: 'es',
  languages: {
    es: 'Español',
    en: 'English',
  },
  warnOnMissing: true,
};

// ====================================
// 4. Supported languages array (useful for validation)
// ====================================
export const supportedLanguages: AppLanguage[] = ['es', 'en'];

// ====================================
// 5. Global singleton instance
// ====================================
export const i18n = new T9nKit(i18nConfig);

// ====================================
// 6. Helper: Extract language from URL
// ====================================
export function getLangFromUrl(url: URL): AppLanguage {
  const [, lang] = url.pathname.split('/');
  
  if (supportedLanguages.includes(lang as AppLanguage)) {
    return lang as AppLanguage;
  }
  
  return i18nConfig.defaultLanguage;
}

// ====================================
// 7. Helper: Get translator for specific language
// ====================================
export function getTranslator(lang: AppLanguage) {
  // Set the language on the global instance
  i18n.setLanguage(lang);
  
  return {
    t: (key: string, params?: any) => i18n.translate(key, params),
    tn: (value: number, options?: Intl.NumberFormatOptions) => 
      i18n.formatNumber(value, options),
    td: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => 
      i18n.formatDate(date, options),
    tc: (value: number, currency?: string) => 
      i18n.formatCurrency(value, currency),
    tr: (value: number, unit: Intl.RelativeTimeFormatUnit) => 
      i18n.formatRelativeTime(value, unit),
    lang, // Current language
  };
}

// ====================================
// 8. Helper: Generate alternate links for SEO
// ====================================
export function getAlternateLinks(currentUrl: URL) {
  const [, currentLang, ...pathParts] = currentUrl.pathname.split('/');
  const isLangInPath = supportedLanguages.includes(currentLang as AppLanguage);
  
  const basePath = isLangInPath 
    ? `/${pathParts.join('/')}` 
    : currentUrl.pathname;

  return supportedLanguages.map((lang) => ({
    lang,
    url: lang === i18nConfig.defaultLanguage 
      ? `${currentUrl.origin}${basePath}${currentUrl.search}`
      : `${currentUrl.origin}/${lang}${basePath}${currentUrl.search}`,
  }));
}

// ====================================
// 9. Helper: Language switcher data
// ====================================
export function getLanguageSwitcher(currentUrl: URL) {
  const currentLang = getLangFromUrl(currentUrl);
  const alternates = getAlternateLinks(currentUrl);

  return {
    current: {
      code: currentLang,
      name: i18nConfig.languages?.[currentLang] || currentLang,
    },
    alternatives: alternates
      .filter((alt) => alt.lang !== currentLang)
      .map((alt) => ({
        code: alt.lang,
        name: i18nConfig.languages?.[alt.lang] || alt.lang,
        url: alt.url,
      })),
  };
}
