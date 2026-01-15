/**
 * Core types for t9nKit translation system
 */

/**
 * Translation value types
 */
export type TranslationValue =
  | string
  | TranslationFunction
  | TranslationPlural
  | TranslationObject;

/**
 * Function-based translation (advanced use)
 */
export type TranslationFunction = (params: Record<string, any>) => string;

/**
 * Pluralization structure
 */
export interface TranslationPlural {
  zero?: string;
  one: string;
  other: string;
}

/**
 * Nested translation object
 */
export interface TranslationObject {
  [key: string]: TranslationValue;
}

/**
 * Translation key (dot notation supported)
 */
export type TranslationKey = string;

/**
 * Parameters for interpolation
 */
export interface TranslationParams {
  [key: string]: string | number | boolean;
}

/**
 * Count for pluralization
 */
export type PluralCount = number;

/**
 * Language configuration
 * Generic type that can be extended by users
 */
export type LanguageCode = string;

/**
 * Translation dictionary structure
 * 
 * @example
 * const translations: TranslationDictionary = {
 *   en: { "hello": "Hello" },
 *   es: { "hello": "Hola" }
 * }
 */
export type TranslationDictionary = Record<
  LanguageCode,
  Record<string, TranslationValue>
>;

/**
 * Configuration options for t9nKit
 */
export interface T9nKitConfig<T extends LanguageCode = string> {
  /**
   * Translation dictionary
   */
  translations: Record<T, Record<string, TranslationValue>>;
  
  /**
   * Default/fallback language
   */
  defaultLanguage: T;
  
  /**
   * Available languages
   * @optional
   */
  languages?: Record<T, string>;
  
  /**
   * Enable console warnings for missing translations
   * @default true
   */
  warnOnMissing?: boolean;
}
