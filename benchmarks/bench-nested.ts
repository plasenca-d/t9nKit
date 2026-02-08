/**
 * Benchmark: Nested/dot-notation key access
 */

import { createTranslator } from "../src/core";
import i18next from "i18next";
import {
  bench,
  compare,
  printComparison,
  generateNestedTranslations,
} from "./setup";

function getDeepKey(depth: number): string {
  const parts: string[] = [];
  for (let i = 0; i < depth - 1; i++) {
    parts.push("level_0");
  }
  parts.push("leaf_0");
  return parts.join(".");
}

export async function runNestedBenchmarks(): Promise<void> {
  console.log("\n=== Nested Key Access ===");

  for (const depth of [2, 5, 10]) {
    const translations = generateNestedTranslations(depth);
    const key = getDeepKey(depth);

    // t9nKit
    const { t } = createTranslator(
      {
        translations: { en: translations },
        defaultLanguage: "en",
      },
      "en",
    );

    // i18next — uses same dot notation
    await i18next.init({
      lng: "en",
      resources: { en: { translation: translations } },
      interpolation: { escapeValue: false },
      keySeparator: ".",
    });

    const t9n = bench(`t9nKit (depth=${depth})`, () => t(key));
    const i18n = bench(`i18next (depth=${depth})`, () => i18next.t(key));

    printComparison(compare(`Nested — depth ${depth}`, t9n, i18n));

    await i18next.init({ lng: "en", resources: {} });
  }
}
