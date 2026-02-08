/**
 * Benchmark: Initialization cost
 */

import { createTranslator } from "../src/core";
import i18next from "i18next";
import {
  bench,
  compare,
  printComparison,
  generateFlatTranslations,
} from "./setup";

export async function runInitBenchmarks(): Promise<void> {
  console.log("\n=== Initialization ===");

  for (const keyCount of [100, 1_000]) {
    const translations = generateFlatTranslations(keyCount);

    const t9n = bench(
      `t9nKit init (${keyCount} keys)`,
      () => {
        createTranslator(
          {
            translations: { en: translations },
            defaultLanguage: "en",
          },
          "en",
        );
      },
      10_000,
    );

    // i18next.createInstance is synchronous init
    const i18n = bench(
      `i18next init (${keyCount} keys)`,
      () => {
        const instance = i18next.createInstance();
        instance.init({
          lng: "en",
          resources: { en: { translation: translations } },
          initAsync: false,
        });
      },
      10_000,
    );

    printComparison(
      compare(`Initialization — ${keyCount} keys`, t9n, i18n),
    );
  }
}
