/**
 * Example migration for Astro projects
 * This shows how to use your existing translations with t9nKit
 */

import type { T9nKitConfig } from "../../src/core/types";

// Define your language type
export type LanguagesSupported = "es" | "en";

// Your existing translations (truncated for example)
export const ui = {
  es: {
    appName: "My Utily",
    common: {
      buttons: {
        copy: "Copiar",
      },
      chars: "caracteres",
    },
    nav: {
      whatsNew: {
        _DEFAULT: "Novedades",
      },
      categories: {
        _DEFAULT: "Categorías",
        design: {
          title: "Diseño",
          shortDescription: "Crea sin limites visuales",
        },
      },
    },
    // ... rest of your translations
  },
  en: {
    appName: "My Utily",
    common: {
      buttons: {
        copy: "Copy",
      },
      chars: "characters",
    },
    nav: {
      whatsNew: {
        _DEFAULT: "What's New",
      },
      categories: {
        _DEFAULT: "Categories",
        design: {
          title: "Design",
          shortDescription: "Create without visual limits",
        },
      },
    },
    // ... rest of your translations
  },
} as const;

// Language names for UI
export const languages: Record<LanguagesSupported, string> = {
  en: "English",
  es: "Español",
};

// Default language
export const defaultLang: LanguagesSupported = "es";

// Configuration for t9nKit
export const t9nKitConfig: T9nKitConfig<LanguagesSupported> = {
  translations: ui,
  defaultLanguage: defaultLang,
  languages: languages,
  warnOnMissing: true,
};

/**
 * Usage in Astro components:
 * 
 * ---
 * import { createTranslator } from 't9nkit';
 * import { t9nKitConfig } from '~/i18n/config';
 * 
 * // Extract language from URL
 * const [, lang] = Astro.url.pathname.split('/');
 * const currentLang = (lang === 'es' || lang === 'en') ? lang : 'es';
 * 
 * const { t, tn, td } = createTranslator(t9nKitConfig, currentLang);
 * ---
 * 
 * <h1>{t('nav.categories.design.title')}</h1>
 * <p>{t('common.chars')}: {tn(123)}</p>
 */
