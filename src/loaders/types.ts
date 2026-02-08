/**
 * Types for t9nKit translation loaders
 */

import type { T9nKitConfig, LanguageCode } from "../core/types";

/**
 * Options for loading translations
 */
export interface LoaderOptions<T extends LanguageCode = string> {
  /**
   * Default/fallback language
   */
  defaultLanguage: NoInfer<T>;

  /**
   * Available languages with display names
   * @optional
   */
  languages?: Record<T, string>;

  /**
   * Enable console warnings for missing translations
   * @default true
   */
  warnOnMissing?: boolean;
}

/**
 * JSON translation file structure
 * Supports nested objects, strings, and plural forms
 */
export type JsonTranslationFile = Record<string, JsonTranslationValue>;

export type JsonTranslationValue =
  | string
  | JsonPluralValue
  | { [key: string]: JsonTranslationValue };

export interface JsonPluralValue {
  zero?: string;
  one: string;
  other: string;
}

/**
 * Result type - returns T9nKitConfig ready to use
 */
export type LoaderResult<T extends LanguageCode = string> = T9nKitConfig<T>;
