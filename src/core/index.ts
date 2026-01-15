/**
 * t9nKit Core
 * Complete translation system with zero dependencies
 */

// Export types
export type {
  TranslationValue,
  TranslationFunction,
  TranslationPlural,
  TranslationObject,
  TranslationKey,
  TranslationParams,
  PluralCount,
  LanguageCode,
  TranslationDictionary,
  T9nKitConfig,
} from "./types";

// Export helpers (for advanced usage)
export {
  interpolate,
  getPluralForm,
  formatNumber,
  formatDate,
  formatCurrency,
  formatRelativeTime,
  getNestedValue,
} from "./helpers";

// Export main translator
export { T9nKit, createTranslator } from "./translator";
