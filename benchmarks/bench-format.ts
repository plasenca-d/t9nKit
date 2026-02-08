/**
 * Benchmark: Number/Date formatting (Intl overhead)
 * Note: i18next doesn't have built-in formatting, so this measures t9nKit's
 * Intl wrappers against raw Intl calls to show overhead is minimal.
 */

import { createTranslator } from "../src/core";
import { bench, printResult } from "./setup";

export function runFormatBenchmarks(): void {
  console.log("\n=== Formatting (t9nKit vs raw Intl) ===");

  const { tn, td, tc } = createTranslator(
    {
      translations: { en: {} },
      defaultLanguage: "en",
    },
    "en",
  );

  const numFmt = new Intl.NumberFormat("en-US");
  const dateFmt = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const curFmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const date = new Date("2026-01-15");

  console.log("\nNumber formatting:");
  printResult(bench("t9nKit tn()", () => tn(1234.56)));
  printResult(bench("raw Intl.NumberFormat", () => numFmt.format(1234.56)));

  console.log("\nDate formatting:");
  printResult(bench("t9nKit td()", () => td(date)));
  printResult(bench("raw Intl.DateTimeFormat", () => dateFmt.format(date)));

  console.log("\nCurrency formatting:");
  printResult(bench("t9nKit tc()", () => tc(1234.56, "USD")));
  printResult(bench("raw Intl.NumberFormat (currency)", () => curFmt.format(1234.56)));
}
