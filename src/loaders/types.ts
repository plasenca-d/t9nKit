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
  defaultLanguage: T;

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
 * ARB (Application Resource Bundle) file structure
 * Used by Flutter/Dart for internationalization
 */
export interface ArbFile {
  /**
   * Locale identifier
   */
  "@@locale"?: string;

  /**
   * Last modified timestamp
   */
  "@@last_modified"?: string;

  /**
   * Translation entries and metadata
   */
  [key: string]: ArbValue | ArbMetadata | string | undefined;
}

export type ArbValue = string;

export interface ArbMetadata {
  description?: string;
  placeholders?: Record<
    string,
    {
      type?: string;
      example?: string;
      description?: string;
    }
  >;
}

/**
 * Result type - returns T9nKitConfig ready to use
 */
export type LoaderResult<T extends LanguageCode = string> = T9nKitConfig<T>;
