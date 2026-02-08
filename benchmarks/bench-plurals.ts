/**
 * Benchmark: Pluralization
 */

import { createTranslator } from "../src/core";
import i18next from "i18next";
import { bench, compare, printComparison } from "./setup";

export async function runPluralBenchmarks(): Promise<void> {
  console.log("\n=== Pluralization ===");

  // t9nKit
  const { t } = createTranslator(
    {
      translations: {
        en: {
          items: {
            zero: "No items",
            one: "1 item",
            other: "{count} items",
          },
        },
      },
      defaultLanguage: "en",
    },
    "en",
  );

  // i18next
  await i18next.init({
    lng: "en",
    resources: {
      en: {
        translation: {
          items_zero: "No items",
          items_one: "1 item",
          items_other: "{{count}} items",
        },
      },
    },
    interpolation: { escapeValue: false },
  });

  for (const count of [0, 1, 42]) {
    const t9n = bench(`t9nKit (count=${count})`, () =>
      t("items", { count }),
    );
    const i18n = bench(`i18next (count=${count})`, () =>
      i18next.t("items", { count }),
    );

    printComparison(compare(`Plural — count=${count}`, t9n, i18n));
  }
}
