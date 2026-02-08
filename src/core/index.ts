/**
 * t9nKit Core
 * Complete translation system with zero dependencies
 */

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
  TranslationLoader,
} from "./types";

export {
  interpolate,
  getPluralForm,
  formatNumber,
  formatDate,
  formatCurrency,
  formatRelativeTime,
  getNestedValue,
} from "./helpers";

export {
  detectLanguage,
  matchLanguage,
  persistLanguage,
} from "./detect-language";
export type {
  DetectLanguageOptions,
  PersistLanguageOptions,
} from "./detect-language";

export { T9nKit, createTranslator } from "./translator";
