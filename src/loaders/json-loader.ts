/**
 * JSON Translation Loader
 * Converts JSON translation files to t9nKit config
 */

import type { TranslationValue } from "../core/types";
import type {
  JsonTranslationFile,
  JsonTranslationValue,
  LoaderOptions,
  LoaderResult,
} from "./types";

/**
 * Check if object is a plural object (has only zero/one/other keys with string values)
 */
function isPluralObject(
  obj: Record<string, unknown>,
): obj is { zero?: string; one: string; other: string } {
  const pluralKeys = ["zero", "one", "other"];
  const keys = Object.keys(obj);

  // Must have 'one' and 'other' at minimum
  if (!("one" in obj) || !("other" in obj)) {
    return false;
  }

  // All keys must be plural keys and all values must be strings
  for (const key of keys) {
    if (!pluralKeys.includes(key)) {
      return false;
    }
    if (typeof obj[key] !== "string") {
      return false;
    }
  }

  return true;
}

/**
 * Converts a JSON translation value to t9nKit TranslationValue
 */
function convertValue(value: JsonTranslationValue): TranslationValue {
  if (typeof value === "string") {
    return value;
  }

  // Check if it's a plural object
  const valueAsRecord = value as Record<string, unknown>;
  if (
    typeof value === "object" &&
    value !== null &&
    isPluralObject(valueAsRecord)
  ) {
    return {
      zero: valueAsRecord.zero as string | undefined,
      one: valueAsRecord.one as string,
      other: valueAsRecord.other as string,
    };
  }

  // It's a nested object
  const result: Record<string, TranslationValue> = {};
  for (const [key, val] of Object.entries(value)) {
    result[key] = convertValue(val as JsonTranslationValue);
  }
  return result;
}

/**
 * Converts a JSON translation file to t9nKit format
 */
function convertJsonFile(
  json: JsonTranslationFile,
): Record<string, TranslationValue> {
  const result: Record<string, TranslationValue> = {};

  for (const [key, value] of Object.entries(json)) {
    result[key] = convertValue(value);
  }

  return result;
}

/**
 * Load translations from JSON objects
 *
 * @example
 * ```typescript
 * import en from './locales/en.json'
 * import es from './locales/es.json'
 *
 * const config = loadJsonTranslations(
 *   { en, es },
 *   { defaultLanguage: 'es' }
 * )
 *
 * // Use with t9nKit
 * const { t } = createTranslator(config, 'es')
 * ```
 */
export function loadJsonTranslations<T extends string = string>(
  translations: Record<T, JsonTranslationFile>,
  options: LoaderOptions<T>,
): LoaderResult<T> {
  const convertedTranslations = {} as Record<
    T,
    Record<string, TranslationValue>
  >;

  for (const [lang, json] of Object.entries(translations) as [
    T,
    JsonTranslationFile,
  ][]) {
    convertedTranslations[lang] = convertJsonFile(json);
  }

  return {
    translations: convertedTranslations,
    defaultLanguage: options.defaultLanguage,
    languages: options.languages,
    warnOnMissing: options.warnOnMissing,
  };
}

/**
 * Load namespaced translations from JSON objects
 *
 * @example
 * ```typescript
 * const config = loadNamespacedJsonTranslations(
 *   {
 *     auth: {
 *       en: { login: "Log in", logout: "Log out" },
 *       es: { login: "Iniciar sesión", logout: "Cerrar sesión" },
 *     },
 *     dashboard: {
 *       en: { title: "Dashboard" },
 *       es: { title: "Panel" },
 *     },
 *   },
 *   { defaultLanguage: 'en' }
 * )
 *
 * const { t } = createTranslator(config, 'en')
 * t('auth:login') // "Log in"
 * ```
 */
export function loadNamespacedJsonTranslations<T extends string = string>(
  namespaces: Record<string, Record<T, JsonTranslationFile>>,
  options: LoaderOptions<T> & { defaultNamespace?: string },
): LoaderResult<T> {
  const convertedNamespaces: Record<
    string,
    Record<T, Record<string, TranslationValue>>
  > = {};

  for (const [nsName, nsTranslations] of Object.entries(namespaces)) {
    const converted = {} as Record<T, Record<string, TranslationValue>>;
    for (const [lang, json] of Object.entries(nsTranslations) as [
      T,
      JsonTranslationFile,
    ][]) {
      converted[lang] = convertJsonFile(json);
    }
    convertedNamespaces[nsName] = converted;
  }

  // Build empty top-level translations for each language
  const languages = new Set<T>();
  for (const nsTranslations of Object.values(namespaces)) {
    for (const lang of Object.keys(nsTranslations) as T[]) {
      languages.add(lang);
    }
  }
  const emptyTranslations = {} as Record<T, Record<string, TranslationValue>>;
  for (const lang of languages) {
    emptyTranslations[lang] = {};
  }

  return {
    translations: emptyTranslations,
    defaultLanguage: options.defaultLanguage,
    languages: options.languages,
    warnOnMissing: options.warnOnMissing,
    namespaces: convertedNamespaces,
    defaultNamespace: options.defaultNamespace,
  };
}
