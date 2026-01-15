import { describe, test, expect, beforeEach } from "bun:test";
import { T9nKit, createTranslator } from "./translator";
import type { T9nKitConfig } from "./types";

describe("T9nKit", () => {
  let warnCalls: string[];
  let originalWarn: typeof console.warn;

  beforeEach(() => {
    warnCalls = [];
    originalWarn = console.warn;
    console.warn = (msg: string) => {
      warnCalls.push(msg);
    };
  });

  const testConfig: T9nKitConfig<"es" | "en"> = {
    translations: {
      es: {
        hello: "Hola",
        welcome: "Bienvenido, {name}",
        nav: {
          home: "Inicio",
          about: "Acerca de",
        },
        items: {
          zero: "Sin artículos",
          one: "1 artículo",
          other: "{count} artículos",
        },
        nested: {
          deep: {
            value: "Valor profundo",
          },
        },
      },
      en: {
        hello: "Hello",
        welcome: "Welcome, {name}",
        nav: {
          home: "Home",
          about: "About",
        },
        items: {
          zero: "No items",
          one: "1 item",
          other: "{count} items",
        },
        nested: {
          deep: {
            value: "Deep value",
          },
        },
      },
    },
    defaultLanguage: "es",
    languages: {
      es: "Español",
      en: "English",
    },
  };

  describe("constructor and language management", () => {
    test("initializes with default language", () => {
      const kit = new T9nKit(testConfig);
      console.warn = originalWarn;
      expect(kit.getLanguage()).toBe("es");
    });

    test("sets language correctly", () => {
      const kit = new T9nKit(testConfig);
      kit.setLanguage("en");
      console.warn = originalWarn;
      expect(kit.getLanguage()).toBe("en");
    });

    test("returns available languages", () => {
      const kit = new T9nKit(testConfig);
      const languages = kit.getLanguages();
      console.warn = originalWarn;
      expect(languages).toEqual({
        es: "Español",
        en: "English",
      });
    });

    test("warns when setting invalid language", () => {
      const kit = new T9nKit(testConfig);
      // @ts-expect-error - testing invalid language
      kit.setLanguage("fr");
      console.warn = originalWarn;
      expect(warnCalls.length).toBeGreaterThan(0);
      expect(kit.getLanguage()).toBe("es"); // Should not change
    });

    test("enables warnings by default", () => {
      const kit = new T9nKit(testConfig);
      kit.translate("nonexistent.key");
      console.warn = originalWarn;
      expect(warnCalls.length).toBeGreaterThan(0);
    });

    test("disables warnings when configured", () => {
      const kit = new T9nKit({ ...testConfig, warnOnMissing: false });
      kit.translate("nonexistent.key");
      console.warn = originalWarn;
      expect(warnCalls.length).toBe(0);
    });
  });

  describe("translate method", () => {
    test("translates simple key", () => {
      const kit = new T9nKit(testConfig);
      console.warn = originalWarn;
      expect(kit.translate("hello")).toBe("Hola");
    });

    test("translates with interpolation", () => {
      const kit = new T9nKit(testConfig);
      console.warn = originalWarn;
      expect(kit.translate("welcome", { name: "Franz" })).toBe(
        "Bienvenido, Franz",
      );
    });

    test("translates nested key with dot notation", () => {
      const kit = new T9nKit(testConfig);
      console.warn = originalWarn;
      expect(kit.translate("nav.home")).toBe("Inicio");
      expect(kit.translate("nested.deep.value")).toBe("Valor profundo");
    });

    test("changes translation based on language", () => {
      const kit = new T9nKit(testConfig);
      expect(kit.translate("hello")).toBe("Hola");
      kit.setLanguage("en");
      console.warn = originalWarn;
      expect(kit.translate("hello")).toBe("Hello");
    });

    test("uses explicit language parameter", () => {
      const kit = new T9nKit(testConfig);
      console.warn = originalWarn;
      expect(kit.translate("hello", undefined, "en")).toBe("Hello");
      expect(kit.getLanguage()).toBe("es"); // Should not change current language
    });

    test("falls back to default language", () => {
      const configWithMissing: T9nKitConfig<"es" | "en"> = {
        ...testConfig,
        translations: {
          ...testConfig.translations,
          en: {
            ...testConfig.translations.en,
            hello: undefined as any,
          },
        },
      };
      const kit = new T9nKit(configWithMissing);
      kit.setLanguage("en");
      console.warn = originalWarn;
      expect(kit.translate("hello")).toBe("Hola"); // Falls back to Spanish
    });

    test("returns key when translation not found", () => {
      const kit = new T9nKit(testConfig);
      console.warn = originalWarn;
      expect(kit.translate("missing.key")).toBe("missing.key");
    });
  });

  describe("pluralization", () => {
    test("handles zero count", () => {
      const kit = new T9nKit(testConfig);
      console.warn = originalWarn;
      expect(kit.translate("items", { count: 0 })).toBe("Sin artículos");
    });

    test("handles singular count", () => {
      const kit = new T9nKit(testConfig);
      console.warn = originalWarn;
      expect(kit.translate("items", { count: 1 })).toBe("1 artículo");
    });

    test("handles plural count", () => {
      const kit = new T9nKit(testConfig);
      console.warn = originalWarn;
      expect(kit.translate("items", { count: 5 })).toBe("5 artículos");
    });

    test("interpolates count in plural translation", () => {
      const kit = new T9nKit(testConfig);
      kit.setLanguage("en");
      console.warn = originalWarn;
      expect(kit.translate("items", { count: 42 })).toBe("42 items");
    });

    test("uses 'other' form when zero not defined", () => {
      const configNoZero: T9nKitConfig<"es" | "en"> = {
        ...testConfig,
        translations: {
          es: {
            simpleItems: {
              one: "1 artículo",
              other: "{count} artículos",
            },
          },
          en: {},
        },
        defaultLanguage: "es",
      };
      const kit = new T9nKit(configNoZero);
      console.warn = originalWarn;
      expect(kit.translate("simpleItems", { count: 0 })).toBe("0 artículos");
    });
  });

  describe("formatting methods", () => {
    test("formats number", () => {
      const kit = new T9nKit(testConfig);
      const result = kit.formatNumber(1234.56);
      console.warn = originalWarn;
      expect(result).toBe("1234,56");
    });

    test("formats date", () => {
      const kit = new T9nKit(testConfig);
      const date = new Date("2026-01-15");
      const result = kit.formatDate(date);
      console.warn = originalWarn;
      expect(result).toContain("enero");
    });

    test("formats currency", () => {
      const kit = new T9nKit(testConfig);
      const result = kit.formatCurrency(1234.56, "EUR");
      console.warn = originalWarn;
      expect(result).toContain("€");
    });

    test("formats relative time", () => {
      const kit = new T9nKit(testConfig);
      const result = kit.formatRelativeTime(-1, "day");
      console.warn = originalWarn;
      expect(result.toLowerCase()).toContain("ayer");
    });
  });

  describe("utility methods", () => {
    test("hasTranslation returns true for existing key", () => {
      const kit = new T9nKit(testConfig);
      console.warn = originalWarn;
      expect(kit.hasTranslation("hello")).toBe(true);
      expect(kit.hasTranslation("nav.home")).toBe(true);
    });

    test("hasTranslation returns false for missing key", () => {
      const kit = new T9nKit(testConfig);
      console.warn = originalWarn;
      expect(kit.hasTranslation("nonexistent")).toBe(false);
    });

    test("hasTranslation checks specific language", () => {
      const kit = new T9nKit(testConfig);
      console.warn = originalWarn;
      expect(kit.hasTranslation("hello", "en")).toBe(true);
    });

    test("getTranslation returns raw string", () => {
      const kit = new T9nKit(testConfig);
      console.warn = originalWarn;
      expect(kit.getTranslation("welcome")).toBe("Bienvenido, {name}");
    });

    test("getTranslation returns key for non-string", () => {
      const kit = new T9nKit(testConfig);
      console.warn = originalWarn;
      expect(kit.getTranslation("items")).toBe("items");
    });
  });
});

describe("createTranslator", () => {
  let originalWarn: typeof console.warn;

  beforeEach(() => {
    originalWarn = console.warn;
    console.warn = () => {};
  });

  const testConfig: T9nKitConfig<"es" | "en"> = {
    translations: {
      es: {
        hello: "Hola",
        welcome: "Bienvenido, {name}",
        items: {
          zero: "Sin artículos",
          one: "1 artículo",
          other: "{count} artículos",
        },
      },
      en: {
        hello: "Hello",
        welcome: "Welcome, {name}",
        items: {
          zero: "No items",
          one: "1 item",
          other: "{count} items",
        },
      },
    },
    defaultLanguage: "es",
  };

  test("creates translator with default language", () => {
    const { t, getLanguage } = createTranslator(testConfig);
    console.warn = originalWarn;
    expect(getLanguage()).toBe("es");
    expect(t("hello")).toBe("Hola");
  });

  test("creates translator with specific language", () => {
    const { t, getLanguage } = createTranslator(testConfig, "en");
    console.warn = originalWarn;
    expect(getLanguage()).toBe("en");
    expect(t("hello")).toBe("Hello");
  });

  test("t function translates correctly", () => {
    const { t } = createTranslator(testConfig, "es");
    console.warn = originalWarn;
    expect(t("hello")).toBe("Hola");
    expect(t("welcome", { name: "Franz" })).toBe("Bienvenido, Franz");
  });

  test("tn function formats numbers", () => {
    const { tn } = createTranslator(testConfig, "es");
    const result = tn(1234.56);
    console.warn = originalWarn;
    expect(result).toBe("1234,56");
  });

  test("td function formats dates", () => {
    const { td } = createTranslator(testConfig, "es");
    const result = td(new Date("2026-01-15"));
    console.warn = originalWarn;
    expect(result).toContain("enero");
  });

  test("tc function formats currency", () => {
    const { tc } = createTranslator(testConfig, "en");
    const result = tc(1234.56, "USD");
    console.warn = originalWarn;
    expect(result).toContain("$");
  });

  test("tr function formats relative time", () => {
    const { tr } = createTranslator(testConfig, "en");
    const result = tr(-1, "day");
    console.warn = originalWarn;
    expect(result.toLowerCase()).toContain("yesterday");
  });

  test("setLanguage changes language", () => {
    const { t, setLanguage, getLanguage } = createTranslator(testConfig, "es");
    expect(t("hello")).toBe("Hola");
    setLanguage("en");
    console.warn = originalWarn;
    expect(getLanguage()).toBe("en");
    expect(t("hello")).toBe("Hello");
  });

  test("hasTranslation checks if key exists", () => {
    const { hasTranslation } = createTranslator(testConfig, "es");
    console.warn = originalWarn;
    expect(hasTranslation("hello")).toBe(true);
    expect(hasTranslation("nonexistent")).toBe(false);
  });

  test("getTranslation returns raw translation", () => {
    const { getTranslation } = createTranslator(testConfig, "es");
    console.warn = originalWarn;
    expect(getTranslation("welcome")).toBe("Bienvenido, {name}");
  });

  test("handles pluralization", () => {
    const { t } = createTranslator(testConfig, "es");
    console.warn = originalWarn;
    expect(t("items", { count: 0 })).toBe("Sin artículos");
    expect(t("items", { count: 1 })).toBe("1 artículo");
    expect(t("items", { count: 5 })).toBe("5 artículos");
  });
});
