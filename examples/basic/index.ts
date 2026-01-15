/**
 * Basic usage example
 * Run with: bun run examples/basic/index.ts
 */

import { createTranslator, T9nKit } from "../../src";

// Example 1: Functional API (recommended)
console.log("=== Example 1: Functional API ===\n");

const { t, tn, td, tc, tr } = createTranslator(
  {
    translations: {
      en: {
        greeting: "Hello, {name}!",
        welcome: "Welcome to t9nKit",
        items: {
          zero: "No items",
          one: "1 item",
          other: "{count} items",
        },
        nested: {
          deep: {
            value: "Deeply nested translation",
          },
        },
      },
      es: {
        greeting: "¡Hola, {name}!",
        welcome: "Bienvenido a t9nKit",
        items: {
          zero: "Sin artículos",
          one: "1 artículo",
          other: "{count} artículos",
        },
        nested: {
          deep: {
            value: "Traducción profundamente anidada",
          },
        },
      },
    },
    defaultLanguage: "es",
  },
  "es",
);

// Simple translations
console.log(t("welcome"));
// Output: "Bienvenido a t9nKit"

// With interpolation
console.log(t("greeting", { name: "Franz" }));
// Output: "¡Hola, Franz!"

// Pluralization
console.log(t("items", { count: 0 })); // "Sin artículos"
console.log(t("items", { count: 1 })); // "1 artículo"
console.log(t("items", { count: 5 })); // "5 artículos"

// Nested translations
console.log(t("nested.deep.value"));
// Output: "Traducción profundamente anidada"

// Number formatting
console.log(tn(1234.56));
// Output: "1.234,56" (Spanish format)

// Date formatting
console.log(td(new Date()));
// Output: "11 de enero de 2026"

// Currency formatting
console.log(tc(1234.56, "EUR"));
// Output: "1.234,56 €"

// Relative time
console.log(tr(-1, "day"));
// Output: "hace 1 día"

console.log(tr(2, "week"));
// Output: "en 2 semanas"

// Example 2: Class-based API
console.log("\n=== Example 2: Class-based API ===\n");

const kit = new T9nKit({
  translations: {
    en: {
      hello: "Hello World",
      dynamic: "Current language: {lang}",
    },
    es: {
      hello: "Hola Mundo",
      dynamic: "Idioma actual: {lang}",
    },
    fr: {
      hello: "Bonjour le monde",
      dynamic: "Langue actuelle: {lang}",
    },
  },
  defaultLanguage: "es",
  languages: {
    en: "English",
    es: "Español",
    fr: "Français",
  },
});

console.log(`Current language: ${kit.getLanguage()}`);
console.log(kit.translate("hello"));
// Output: "Hola Mundo"

kit.setLanguage("en");
console.log(`\nSwitched to: ${kit.getLanguage()}`);
console.log(kit.translate("hello"));
// Output: "Hello World"

kit.setLanguage("fr");
console.log(`\nSwitched to: ${kit.getLanguage()}`);
console.log(kit.translate("hello"));
// Output: "Bonjour le monde"

// Check if translation exists
console.log(`\nHas 'hello' translation: ${kit.hasTranslation("hello")}`);
console.log(
  `Has 'missing.key' translation: ${kit.hasTranslation("missing.key")}`,
);

// Example 3: Error handling and edge cases
console.log("\n=== Example 3: Error Handling ===\n");

// Missing translation key (returns key as fallback)
console.log(t("this.key.does.not.exist"));
// Output: "this.key.does.not.exist" (with console warning)

// Interpolation with missing parameter (keeps placeholder)
console.log(t("greeting", { wrongParam: "value" }));
// Output: "¡Hola, {name}!" (name placeholder preserved)

// Fallback to default language
const { t: tEnglish } = createTranslator(
  {
    translations: {
      en: {
        "only.in.english": "This is only in English",
      },
      es: {
        common: "Común",
      },
    },
    defaultLanguage: "en",
  },
  "es",
);

console.log(tEnglish("only.in.english"));
// Output: "This is only in English" (falls back to default)

// Get raw translation (without interpolation)
console.log("\nRaw translation:", kit.getTranslation("dynamic"));
// Output: "Langue actuelle: {lang}"

console.log("\n✅ All examples completed!");
