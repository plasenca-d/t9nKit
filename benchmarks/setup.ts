/**
 * Benchmark harness — simple, no dependencies
 */

export interface BenchResult {
  label: string;
  iterations: number;
  totalMs: number;
  opsPerSec: number;
  avgNs: number;
}

export interface Comparison {
  label: string;
  t9nKit: BenchResult;
  i18next: BenchResult;
  speedup: string;
}

const DEFAULT_ITERATIONS = 100_000;
const WARMUP_ITERATIONS = 1_000;

export function bench(
  label: string,
  fn: () => void,
  iterations = DEFAULT_ITERATIONS,
): BenchResult {
  // Warmup
  for (let i = 0; i < WARMUP_ITERATIONS; i++) fn();

  const start = performance.now();
  for (let i = 0; i < iterations; i++) fn();
  const totalMs = performance.now() - start;

  const opsPerSec = Math.round((iterations / totalMs) * 1000);
  const avgNs = Math.round((totalMs / iterations) * 1_000_000);

  return { label, iterations, totalMs, opsPerSec, avgNs };
}

export function compare(
  label: string,
  t9n: BenchResult,
  i18n: BenchResult,
): Comparison {
  const ratio = t9n.opsPerSec / i18n.opsPerSec;
  const speedup =
    ratio >= 1 ? `${ratio.toFixed(1)}x faster` : `${(1 / ratio).toFixed(1)}x slower`;

  return { label, t9nKit: t9n, i18next: i18n, speedup };
}

export function printResult(r: BenchResult): void {
  console.log(
    `  ${r.label.padEnd(35)} ${fmtOps(r.opsPerSec).padStart(12)} ops/s  (${r.avgNs} ns/op)`,
  );
}

export function printComparison(c: Comparison): void {
  console.log(`\n${c.label}`);
  printResult(c.t9nKit);
  printResult(c.i18next);
  console.log(`  => t9nKit is ${c.speedup}`);
}

function fmtOps(n: number): string {
  return n.toLocaleString("en-US");
}

// ─── Data generators ──────────────────────────────────────────────────────

export function generateFlatTranslations(
  count: number,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (let i = 0; i < count; i++) {
    result[`key_${i}`] = `Value for key ${i}`;
  }
  return result;
}

export function generateNestedTranslations(
  depth: number,
  breadth = 3,
): Record<string, any> {
  if (depth <= 1) {
    const result: Record<string, string> = {};
    for (let i = 0; i < breadth; i++) {
      result[`leaf_${i}`] = `Value at leaf ${i}`;
    }
    return result;
  }

  const result: Record<string, any> = {};
  for (let i = 0; i < breadth; i++) {
    result[`level_${i}`] = generateNestedTranslations(depth - 1, breadth);
  }
  return result;
}

export function generateInterpolationString(varCount: number): string {
  const parts: string[] = ["Text"];
  for (let i = 0; i < varCount; i++) {
    parts.push(`{var_${i}}`);
  }
  return parts.join(" ");
}

export function generateInterpolationParams(
  varCount: number,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (let i = 0; i < varCount; i++) {
    result[`var_${i}`] = `value_${i}`;
  }
  return result;
}
