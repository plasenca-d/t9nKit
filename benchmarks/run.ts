/**
 * Benchmark runner — executes all benchmarks and prints results
 * Run with: bun run benchmarks/run.ts
 */

import { runTranslateBenchmarks } from "./bench-translate";
import { runInterpolationBenchmarks } from "./bench-interpolation";
import { runPluralBenchmarks } from "./bench-plurals";
import { runNestedBenchmarks } from "./bench-nested";
import { runInitBenchmarks } from "./bench-init";
import { runFormatBenchmarks } from "./bench-format";

console.log("t9nKit vs i18next — Performance Benchmarks");
console.log("=".repeat(60));

await runTranslateBenchmarks();
await runInterpolationBenchmarks();
await runPluralBenchmarks();
await runNestedBenchmarks();
await runInitBenchmarks();
runFormatBenchmarks();

console.log("\n" + "=".repeat(60));
console.log("Done.");
