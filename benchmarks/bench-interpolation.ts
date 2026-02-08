/**
 * Benchmark: Variable interpolation
 */

import { createTranslator } from "../src/core";
import i18next from "i18next";
import {
  bench,
  compare,
  printComparison,
  generateInterpolationString,
  generateInterpolationParams,
} from "./setup";

export async function runInterpolationBenchmarks(): Promise<void> {
  console.log("\n=== Interpolation ===");

  for (const varCount of [1, 3, 10]) {
    const template = generateInterpolationString(varCount);
    const params = generateInterpolationParams(varCount);

    // i18next uses {{var}} syntax
    const i18nextTemplate = template.replace(/\{(\w+)\}/g, "{{$1}}");

    // t9nKit
    const { t } = createTranslator(
      {
        translations: { en: { msg: template } },
        defaultLanguage: "en",
      },
      "en",
    );

    // i18next
    await i18next.init({
      lng: "en",
      resources: { en: { translation: { msg: i18nextTemplate } } },
      interpolation: { escapeValue: false },
    });

    const t9n = bench(`t9nKit (${varCount} vars)`, () => t("msg", params));
    const i18n = bench(`i18next (${varCount} vars)`, () =>
      i18next.t("msg", params),
    );

    printComparison(
      compare(`Interpolation — ${varCount} variable(s)`, t9n, i18n),
    );

    await i18next.init({ lng: "en", resources: {} });
  }
}
