import type { PluralCount, TranslationParams, LanguageCode } from "./types";

/**
 * Interpolates variables into a text string
 * @example interpolate("Hello {name}", { name: "John" }) => "Hello John"
 */
export function interpolate(
  text: string,
  params: TranslationParams = {},
): string {
  return Object.entries(params).reduce((result, [key, value]) => {
    const regex = new RegExp(`\\{${key}\\}`, "g");
    return result.replace(regex, String(value));
  }, text);
}

/**
 * Determines the correct plural form based on count
 * Rules for English and Spanish (can be extended)
 */
export function getPluralForm(
  count: PluralCount,
  lang: LanguageCode,
): "zero" | "one" | "other" {
  if (count === 0) return "zero";
  if (count === 1) return "one";
  return "other";
}

/**
 * Formats numbers according to language
 * @example formatNumber(1234.56, "es") => "1.234,56"
 */
export function formatNumber(
  value: number,
  lang: LanguageCode,
  options?: Intl.NumberFormatOptions,
): string {
  // Map common language codes to locales
  const localeMap: Record<string, string> = {
    es: "es-ES",
    en: "en-US",
    fr: "fr-FR",
    de: "de-DE",
    pt: "pt-BR",
    it: "it-IT",
    ja: "ja-JP",
    zh: "zh-CN",
    ru: "ru-RU",
  };

  const locale = localeMap[lang] || lang;
  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * Formats dates according to language
 * @example formatDate(new Date(), "es") => "25 de octubre de 2025"
 */
export function formatDate(
  date: Date | string | number,
  lang: LanguageCode,
  options?: Intl.DateTimeFormatOptions,
): string {
  const localeMap: Record<string, string> = {
    es: "es-ES",
    en: "en-US",
    fr: "fr-FR",
    de: "de-DE",
    pt: "pt-BR",
    it: "it-IT",
    ja: "ja-JP",
    zh: "zh-CN",
    ru: "ru-RU",
  };

  const locale = localeMap[lang] || lang;
  const dateObj =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  };

  return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
}

/**
 * Formats currency according to language
 * @example formatCurrency(1234.56, "es", "EUR") => "1.234,56 €"
 */
export function formatCurrency(
  value: number,
  lang: LanguageCode,
  currency: string = "USD",
): string {
  const localeMap: Record<string, string> = {
    es: "es-ES",
    en: "en-US",
    fr: "fr-FR",
    de: "de-DE",
    pt: "pt-BR",
    it: "it-IT",
    ja: "ja-JP",
    zh: "zh-CN",
    ru: "ru-RU",
  };

  const locale = localeMap[lang] || lang;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(value);
}

/**
 * Formats relative time
 * @example formatRelativeTime(-1, "day", "es") => "hace 1 día"
 */
export function formatRelativeTime(
  value: number,
  unit: Intl.RelativeTimeFormatUnit,
  lang: LanguageCode,
): string {
  const localeMap: Record<string, string> = {
    es: "es-ES",
    en: "en-US",
    fr: "fr-FR",
    de: "de-DE",
    pt: "pt-BR",
    it: "it-IT",
    ja: "ja-JP",
    zh: "zh-CN",
    ru: "ru-RU",
  };

  const locale = localeMap[lang] || lang;
  return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
    value,
    unit,
  );
}

/**
 * Accesses nested translations using dot notation
 * @example getNestedValue({ user: { name: "John" } }, "user.name") => "John"
 */
export function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => current?.[key], obj);
}
