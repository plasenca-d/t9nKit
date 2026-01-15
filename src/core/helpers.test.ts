import { describe, test, expect } from "bun:test";
import {
  interpolate,
  getPluralForm,
  formatNumber,
  formatDate,
  formatCurrency,
  formatRelativeTime,
  getNestedValue,
} from "./helpers";

describe("helpers", () => {
  describe("interpolate", () => {
    test("replaces single variable", () => {
      expect(interpolate("Hello {name}", { name: "Franz" })).toBe(
        "Hello Franz",
      );
    });

    test("replaces multiple variables", () => {
      expect(
        interpolate("Hello {name}, you are {age} years old", {
          name: "Franz",
          age: 25,
        }),
      ).toBe("Hello Franz, you are 25 years old");
    });

    test("handles missing variables", () => {
      expect(interpolate("Hello {name}", {})).toBe("Hello {name}");
    });

    test("replaces same variable multiple times", () => {
      expect(interpolate("{name} loves {name}", { name: "Franz" })).toBe(
        "Franz loves Franz",
      );
    });

    test("handles empty params", () => {
      expect(interpolate("Hello world", {})).toBe("Hello world");
    });

    test("converts numbers and booleans to strings", () => {
      expect(
        interpolate("Count: {count}, Active: {active}", {
          count: 42,
          active: true,
        }),
      ).toBe("Count: 42, Active: true");
    });
  });

  describe("getPluralForm", () => {
    test("returns zero for count 0", () => {
      expect(getPluralForm(0, "es")).toBe("zero");
      expect(getPluralForm(0, "en")).toBe("zero");
    });

    test("returns one for count 1", () => {
      expect(getPluralForm(1, "es")).toBe("one");
      expect(getPluralForm(1, "en")).toBe("one");
    });

    test("returns other for count > 1", () => {
      expect(getPluralForm(2, "es")).toBe("other");
      expect(getPluralForm(5, "en")).toBe("other");
      expect(getPluralForm(100, "es")).toBe("other");
    });
  });

  describe("formatNumber", () => {
    test("formats number in Spanish locale", () => {
      const result = formatNumber(1234.56, "es");
      expect(result).toBe("1234,56");
    });

    test("formats number in English locale", () => {
      const result = formatNumber(1234.56, "en");
      expect(result).toBe("1,234.56");
    });

    test("formats with custom options", () => {
      const result = formatNumber(0.156, "en", {
        style: "percent",
        minimumFractionDigits: 1,
      });
      expect(result).toContain("15.6");
    });

    test("handles unknown locale", () => {
      const result = formatNumber(1234.56, "xyz");
      expect(result).toMatch(/\d/);
    });
  });

  describe("formatDate", () => {
    test("formats date in Spanish locale", () => {
      const date = new Date("2026-01-15");
      const result = formatDate(date, "es");
      expect(result).toContain("enero");
      expect(result).toContain("2026");
    });

    test("formats date in English locale", () => {
      const date = new Date("2026-01-15");
      const result = formatDate(date, "en");
      expect(result).toContain("January");
      expect(result).toContain("2026");
    });

    test("accepts string date", () => {
      const result = formatDate("2026-01-15", "en");
      expect(result).toContain("January");
    });

    test("accepts timestamp", () => {
      const timestamp = new Date("2026-01-15").getTime();
      const result = formatDate(timestamp, "en");
      expect(result).toContain("January");
    });

    test("formats with custom options", () => {
      const date = new Date("2026-01-15");
      const result = formatDate(date, "en", {
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
      });
      expect(result).toMatch(/\d+\/\d+\/\d+/);
    });
  });

  describe("formatCurrency", () => {
    test("formats USD in English locale", () => {
      const result = formatCurrency(1234.56, "en", "USD");
      expect(result).toContain("1,234.56");
      expect(result).toContain("$");
    });

    test("formats EUR in Spanish locale", () => {
      const result = formatCurrency(1234.56, "es", "EUR");
      expect(result).toContain("1234,56");
      expect(result).toContain("€");
    });

    test("uses USD as default currency", () => {
      const result = formatCurrency(100, "en");
      expect(result).toContain("$");
    });

    test("formats GBP correctly", () => {
      const result = formatCurrency(1234.56, "en", "GBP");
      expect(result).toContain("£");
    });
  });

  describe("formatRelativeTime", () => {
    test("formats past time in Spanish", () => {
      const result = formatRelativeTime(-1, "day", "es");
      expect(result.toLowerCase()).toContain("ayer");
    });

    test("formats future time in Spanish", () => {
      const result = formatRelativeTime(2, "week", "es");
      expect(result.toLowerCase()).toMatch(/dentro|en/);
    });

    test("formats past time in English", () => {
      const result = formatRelativeTime(-1, "day", "en");
      expect(result.toLowerCase()).toContain("yesterday");
    });

    test("formats future time in English", () => {
      const result = formatRelativeTime(3, "month", "en");
      expect(result.toLowerCase()).toMatch(/in 3 months/);
    });

    test("formats zero time", () => {
      const result = formatRelativeTime(0, "day", "en");
      expect(result.toLowerCase()).toContain("today");
    });
  });

  describe("getNestedValue", () => {
    test("accesses nested property", () => {
      const obj = { user: { name: "Franz" } };
      expect(getNestedValue(obj, "user.name")).toBe("Franz");
    });

    test("accesses deeply nested property", () => {
      const obj = { a: { b: { c: { d: "value" } } } };
      expect(getNestedValue(obj, "a.b.c.d")).toBe("value");
    });

    test("returns undefined for missing property", () => {
      const obj = { user: { name: "Franz" } };
      expect(getNestedValue(obj, "user.age")).toBeUndefined();
    });

    test("returns undefined for missing nested path", () => {
      const obj = { user: { name: "Franz" } };
      expect(getNestedValue(obj, "profile.email")).toBeUndefined();
    });

    test("accesses top-level property", () => {
      const obj = { hello: "world" };
      expect(getNestedValue(obj, "hello")).toBe("world");
    });

    test("handles array access", () => {
      const obj = { items: ["first", "second", "third"] };
      expect(getNestedValue(obj, "items.1")).toBe("second");
    });
  });
});
