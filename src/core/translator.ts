import type {
  T9nKitConfig,
  LanguageCode,
  PluralCount,
  TranslationParams,
  TranslationPlural,
} from "./types";
import {
  formatCurrency,
  formatDate,
  formatNumber,
  formatRelativeTime,
  getNestedValue,
  getPluralForm,
  interpolate,
} from "./helpers";

/**
 * T9nKit - Translation Kit
 * Main translator class
 */
export class T9nKit<T extends LanguageCode = string> {
  private config: T9nKitConfig<T>;
  private currentLanguage: T;

  constructor(config: T9nKitConfig<T>) {
    this.config = {
      warnOnMissing: true,
      ...config,
    };
    this.currentLanguage = config.defaultLanguage;
  }

  /**
   * Get current language
   */
  getLanguage(): T {
    return this.currentLanguage;
  }

  /**
   * Set current language
   */
  setLanguage(lang: T): void {
    if (!this.config.translations[lang]) {
      this.warn(`Language "${lang}" not found in translations`);
      return;
    }
    this.currentLanguage = lang;
  }

  /**
   * Get all available languages
   */
  getLanguages(): Record<T, string> | undefined {
    return this.config.languages;
  }

  /**
   * Main translation function
   * Supports dot notation (nav.home) and nested objects
   */
  translate(
    key: string,
    params?: TranslationParams & { count?: PluralCount },
    lang?: T,
  ): string {
    const targetLang = lang || this.currentLanguage;

    let translation = getNestedValue(this.config.translations[targetLang], key);

    // Fallback to default language if not found
    if (!translation) {
      translation = getNestedValue(
        this.config.translations[this.config.defaultLanguage],
        key,
      );
    }

    if (!translation) {
      this.warn(`Translation missing for key: ${key}`);
      return key;
    }

    // Case 1: Pluralization object
    if (
      typeof translation === "object" &&
      "one" in translation &&
      params?.count !== undefined
    ) {
      return this.handlePlural(translation, params.count, params, targetLang);
    }

    // Case 2: Translation function
    if (typeof translation === "function") {
      return translation(params || {});
    }

    // Case 3: Simple string with possible interpolation
    if (typeof translation === "string") {
      return params ? interpolate(translation, params) : translation;
    }

    // Case 4: Nested object (return key as fallback)
    if (typeof translation === "object") {
      this.warn(`Translation for key "${key}" is an object, not a string`);
      return key;
    }

    return key;
  }

  /**
   * Handle pluralization translations
   */
  private handlePlural(
    pluralObj: TranslationPlural,
    count: PluralCount,
    params: TranslationParams,
    lang: T,
  ): string {
    const form = getPluralForm(count, lang);
    let text = pluralObj[form] || pluralObj.other;

    // Add count in parameters whether used or not
    const finalParams = { ...params, count };
    return interpolate(text, finalParams);
  }

  /**
   * Format number according to current language
   */
  formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
    return formatNumber(value, this.currentLanguage, options);
  }

  /**
   * Format date according to current language
   */
  formatDate(
    date: Date | string | number,
    options?: Intl.DateTimeFormatOptions,
  ): string {
    return formatDate(date, this.currentLanguage, options);
  }

  /**
   * Format currency according to current language
   */
  formatCurrency(value: number, currency?: string): string {
    return formatCurrency(value, this.currentLanguage, currency);
  }

  /**
   * Format relative time according to current language
   */
  formatRelativeTime(value: number, unit: Intl.RelativeTimeFormatUnit): string {
    return formatRelativeTime(value, unit, this.currentLanguage);
  }

  /**
   * Check if a translation key exists
   */
  hasTranslation(key: string, lang?: T): boolean {
    const targetLang = lang || this.currentLanguage;
    const translation =
      getNestedValue(this.config.translations[targetLang], key) ||
      getNestedValue(
        this.config.translations[this.config.defaultLanguage],
        key,
      );
    return translation !== undefined;
  }

  /**
   * Get translation without interpolation
   */
  getTranslation(key: string, lang?: T): string {
    const targetLang = lang || this.currentLanguage;
    const translation =
      getNestedValue(this.config.translations[targetLang], key) ||
      getNestedValue(
        this.config.translations[this.config.defaultLanguage],
        key,
      );

    if (typeof translation === "string") {
      return translation;
    }

    this.warn(`Translation for key "${key}" is not a simple string`);
    return key;
  }

  /**
   * Internal warning logger
   */
  private warn(message: string): void {
    if (this.config.warnOnMissing) {
      console.warn(`[t9nKit] ${message}`);
    }
  }
}

/**
 * Creates a translation hook similar to the original useTranslations
 * Returns translation functions bound to a specific language
 */
export function createTranslator<T extends LanguageCode = string>(
  config: T9nKitConfig<T>,
  lang?: T,
): {
  t: (
    key: string,
    params?: TranslationParams & { count?: PluralCount },
  ) => string;
  tn: (value: number, options?: Intl.NumberFormatOptions) => string;
  td: (
    date: Date | string | number,
    options?: Intl.DateTimeFormatOptions,
  ) => string;
  tc: (value: number, currency?: string) => string;
  tr: (value: number, unit: Intl.RelativeTimeFormatUnit) => string;
  getLanguage: () => T;
  setLanguage: (newLang: T) => void;
  hasTranslation: (key: string) => boolean;
  getTranslation: (key: string) => string;
} {
  const kit = new T9nKit(config);
  if (lang) kit.setLanguage(lang);

  return {
    /**
     * Main translation function
     */
    t: (
      key: string,
      params?: TranslationParams & { count?: PluralCount },
    ): string => kit.translate(key, params),

    /**
     * Format number according to language
     * @example tn(1234.56) // "1.234,56" (es) o "1,234.56" (en)
     */
    tn: (value: number, options?: Intl.NumberFormatOptions): string =>
      kit.formatNumber(value, options),

    /**
     * Format date according to language
     * @example td(new Date()) // "25 de octubre de 2025" (es)
     */
    td: (
      date: Date | string | number,
      options?: Intl.DateTimeFormatOptions,
    ): string => kit.formatDate(date, options),

    /**
     * Format currency according to language
     * @example tc(1234.56, "EUR") // "1.234,56 €" (es)
     */
    tc: (value: number, currency?: string): string =>
      kit.formatCurrency(value, currency),

    /**
     * Format relative time
     * @example tr(-1, "day") // "hace 1 día" (es) o "1 day ago" (en)
     */
    tr: (value: number, unit: Intl.RelativeTimeFormatUnit): string =>
      kit.formatRelativeTime(value, unit),

    /**
     * Get current language
     */
    getLanguage: (): T => kit.getLanguage(),

    /**
     * Set current language
     */
    setLanguage: (newLang: T): void => kit.setLanguage(newLang),

    /**
     * Check if translation exists
     */
    hasTranslation: (key: string): boolean => kit.hasTranslation(key),

    /**
     * Get raw translation
     */
    getTranslation: (key: string): string => kit.getTranslation(key),
  };
}
