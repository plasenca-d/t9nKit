/**
 * t9nKit Loaders
 * Load translations from JSON files
 *
 * @example
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
 */

// Export types
export type {
  LoaderOptions,
  LoaderResult,
  JsonTranslationFile,
  JsonTranslationValue,
  JsonPluralValue,
} from "./types";

// Export loaders
export {
  loadJsonTranslations,
  loadNamespacedJsonTranslations,
} from "./json-loader";
