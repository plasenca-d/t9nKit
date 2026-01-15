/**
 * t9nKit - Translation Kit
 * Complete i18n solution with zero dependencies
 * 
 * @example Basic usage
 * ```ts
 * import { createTranslator } from 't9nkit';
 * 
 * const { t, tn, td } = createTranslator({
 *   translations: {
 *     en: { "hello": "Hello" },
 *     es: { "hello": "Hola" }
 *   },
 *   defaultLanguage: 'es'
 * }, 'es');
 * 
 * t('hello'); // "Hola"
 * ```
 * 
 * @example Class-based usage
 * ```ts
 * import { T9nKit } from 't9nkit';
 * 
 * const kit = new T9nKit({
 *   translations: {
 *     en: { "hello": "Hello {name}" },
 *     es: { "hello": "Hola {name}" }
 *   },
 *   defaultLanguage: 'es'
 * });
 * 
 * kit.translate('hello', { name: 'Franz' }); // "Hola Franz"
 * ```
 */

// Re-export everything from core
export * from "./core";

// Default export for convenience
export { createTranslator as default } from "./core";
