/**
 * t9nKit Loaders
 * Load translations from external file formats (JSON, ARB)
 *
 * @example JSON usage
 * ```typescript
 * import { loadJsonTranslations } from 't9nkit/loaders'
 * import en from './locales/en.json'
 * import es from './locales/es.json'
 *
 * const config = loadJsonTranslations(
 *   { en, es },
 *   { defaultLanguage: 'es' }
 * )
 * ```
 *
 * @example ARB usage (Flutter/Dart format)
 * ```typescript
 * import { loadArbTranslations } from 't9nkit/loaders'
 * import en from './locales/app_en.arb'
 * import es from './locales/app_es.arb'
 *
 * const config = loadArbTranslations(
 *   { en, es },
 *   { defaultLanguage: 'es' }
 * )
 * ```
 */

// Export types
export type {
  LoaderOptions,
  LoaderResult,
  JsonTranslationFile,
  JsonTranslationValue,
  JsonPluralValue,
  ArbFile,
  ArbValue,
  ArbMetadata,
} from "./types";

// Export loaders
export { loadJsonTranslations } from "./json-loader";
export { loadArbTranslations } from "./arb-loader";
