/**
 * ARB (Application Resource Bundle) Translation Loader
 * Converts ARB files (Flutter/Dart format) to t9nKit config
 */

import type { TranslationValue, TranslationPlural } from "../core/types";
import type { ArbFile, LoaderOptions, LoaderResult } from "./types";

/**
 * Parse ICU plural syntax from ARB format
 * Example: "{count, plural, zero{No items} one{1 item} other{{count} items}}"
 */
function parseIcuPlural(value: string): TranslationPlural | null {
  // Match pattern: {varName, plural, ...forms}
  const pluralMatch = value.match(/^\{(\w+),\s*plural,\s*(.+)\}$/s);

  if (!pluralMatch || !pluralMatch[1] || !pluralMatch[2]) {
    return null;
  }

  const varName = pluralMatch[1];
  const formsString = pluralMatch[2];
  const forms: TranslationPlural = { one: "", other: "" };

  // Parse each form: zero{...} one{...} other{...}
  // Handle nested braces by counting brace depth
  let remaining = formsString.trim();

  while (remaining.length > 0) {
    // Match form name (zero, one, two, few, many, other, or =N)
    const formMatch = remaining.match(
      /^(zero|one|two|few|many|other|=\d+)\s*\{/,
    );
    if (!formMatch || !formMatch[1]) break;

    const formName = formMatch[1];
    let braceDepth = 1;
    let contentStart = formMatch[0].length;
    let contentEnd = contentStart;

    // Find matching closing brace
    for (let i = contentStart; i < remaining.length && braceDepth > 0; i++) {
      if (remaining[i] === "{") braceDepth++;
      else if (remaining[i] === "}") braceDepth--;
      if (braceDepth === 0) contentEnd = i;
    }

    let content = remaining.slice(contentStart, contentEnd);

    // Convert {varName} to t9nKit's {count} format if it's the plural variable
    content = content.replace(new RegExp(`\\{${varName}\\}`, "g"), "{count}");

    // Map ICU forms to t9nKit forms
    const normalizedForm = formName.startsWith("=")
      ? formName === "=0"
        ? "zero"
        : formName === "=1"
          ? "one"
          : "other"
      : formName;

    if (
      normalizedForm === "zero" ||
      normalizedForm === "one" ||
      normalizedForm === "other"
    ) {
      forms[normalizedForm] = content;
    }

    remaining = remaining.slice(contentEnd + 1).trim();
  }

  // Ensure we have at least 'one' and 'other'
  if (!forms.one && forms.other) {
    forms.one = forms.other;
  }
  if (!forms.other && forms.one) {
    forms.other = forms.one;
  }

  return forms.one && forms.other ? forms : null;
}

/**
 * Convert ARB interpolation {name} to t9nKit format (already compatible)
 * Also handles named parameters like {name} which are already in correct format
 */
function convertInterpolation(value: string): string {
  // ARB uses {name} format which is already compatible with t9nKit
  return value;
}

/**
 * Check if a key is ARB metadata (starts with @ or @@)
 */
function isMetadataKey(key: string): boolean {
  return key.startsWith("@");
}

/**
 * Convert an ARB file to t9nKit translation format
 */
function convertArbFile(arb: ArbFile): Record<string, TranslationValue> {
  const result: Record<string, TranslationValue> = {};

  for (const [key, value] of Object.entries(arb)) {
    // Skip metadata keys
    if (isMetadataKey(key)) {
      continue;
    }

    if (typeof value !== "string") {
      continue;
    }

    // Try to parse as ICU plural
    const plural = parseIcuPlural(value);
    if (plural) {
      result[key] = plural;
    } else {
      // Regular string with possible interpolation
      result[key] = convertInterpolation(value);
    }
  }

  return result;
}

/**
 * Load translations from ARB (Application Resource Bundle) objects
 *
 * ARB is the format used by Flutter/Dart for internationalization.
 *
 * @example
 * ```typescript
 * import en from './locales/app_en.arb'
 * import es from './locales/app_es.arb'
 *
 * const config = loadArbTranslations(
 *   { en, es },
 *   { defaultLanguage: 'es' }
 * )
 *
 * // Use with t9nKit
 * const { t } = createTranslator(config, 'es')
 * ```
 *
 * @example ARB file format
 * ```json
 * {
 *   "@@locale": "en",
 *   "greeting": "Hello, {name}!",
 *   "@greeting": {
 *     "description": "Greeting message",
 *     "placeholders": {
 *       "name": { "type": "String" }
 *     }
 *   },
 *   "itemCount": "{count, plural, zero{No items} one{1 item} other{{count} items}}"
 * }
 * ```
 */
export function loadArbTranslations<T extends string = string>(
  translations: Record<T, ArbFile>,
  options: LoaderOptions<T>,
): LoaderResult<T> {
  const convertedTranslations = {} as Record<
    T,
    Record<string, TranslationValue>
  >;

  for (const [lang, arb] of Object.entries(translations) as [T, ArbFile][]) {
    convertedTranslations[lang] = convertArbFile(arb);
  }

  return {
    translations: convertedTranslations,
    defaultLanguage: options.defaultLanguage,
    languages: options.languages,
    warnOnMissing: options.warnOnMissing,
  };
}
