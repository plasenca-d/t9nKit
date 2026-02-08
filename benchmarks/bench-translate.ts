/**
 * Benchmark: Simple key translation (flat lookups)
 */

import { createTranslator } from "../src/core";
import i18next from "i18next";
import {
  bench,
  compare,
  printComparison,
  generateFlatTranslations,
} from "./setup";

export async function runTranslateBenchmarks(): Promise<void> {
  console.log("\n=== Translation Lookup ===");

  for (const keyCount of [100, 1_000, 10_000]) {
    const translations = generateFlatTranslations(keyCount);
    const midKey = `key_${Math.floor(keyCount / 2)}`;

    // t9nKit setup
    const { t } = createTranslator(
      {
        translations: { en: translations },
        defaultLanguage: "en",
      },
      "en",
    );

    // i18next setup
    await i18next.init({
      lng: "en",
      resources: { en: { translation: translations } },
      interpolation: { escapeValue: false },
    });

    const t9n = bench(`t9nKit (${keyCount} keys)`, () => t(midKey));
    const i18n = bench(`i18next (${keyCount} keys)`, () => i18next.t(midKey));

    printComparison(compare(`Flat lookup — ${keyCount} keys`, t9n, i18n));

    // Reset i18next for next iteration
    await i18next.init({ lng: "en", resources: {} });
  }
}
