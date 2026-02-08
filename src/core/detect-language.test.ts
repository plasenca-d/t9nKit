import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import {
  detectLanguage,
  matchLanguage,
  persistLanguage,
} from "./detect-language";

describe("matchLanguage", () => {
  const supported = ["en", "es", "fr"] as const;

  test("exact match", () => {
    expect(matchLanguage("es", [...supported])).toBe("es");
  });

  test("exact match case-insensitive", () => {
    expect(matchLanguage("ES", [...supported])).toBe("es");
  });

  test("base language match: en-US -> en", () => {
    expect(matchLanguage("en-US", [...supported])).toBe("en");
  });

  test("base language match: fr-CA -> fr", () => {
    expect(matchLanguage("fr-CA", [...supported])).toBe("fr");
  });

  test("prefix match: en -> en-US", () => {
    const withRegion = ["en-US", "es-MX", "fr-FR"];
    expect(matchLanguage("en", withRegion)).toBe("en-US");
  });

  test("returns null for unsupported language", () => {
    expect(matchLanguage("de", [...supported])).toBeNull();
  });

  test("returns null for empty string", () => {
    expect(matchLanguage("", [...supported])).toBeNull();
  });
});

describe("detectLanguage", () => {
  let originalNavigator: PropertyDescriptor | undefined;
  let originalDocument: PropertyDescriptor | undefined;
  let originalLocalStorage: PropertyDescriptor | undefined;
  let originalLocation: PropertyDescriptor | undefined;

  beforeEach(() => {
    originalNavigator = Object.getOwnPropertyDescriptor(
      globalThis,
      "navigator",
    );
    originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
    originalLocalStorage = Object.getOwnPropertyDescriptor(
      globalThis,
      "localStorage",
    );
    originalLocation = Object.getOwnPropertyDescriptor(globalThis, "location");
  });

  afterEach(() => {
    // Restore originals
    if (originalNavigator) {
      Object.defineProperty(globalThis, "navigator", originalNavigator);
    }
    if (originalDocument) {
      Object.defineProperty(globalThis, "document", originalDocument);
    }
    if (originalLocalStorage) {
      Object.defineProperty(globalThis, "localStorage", originalLocalStorage);
    }
    if (originalLocation) {
      Object.defineProperty(globalThis, "location", originalLocation);
    }
  });

  test("returns defaultLanguage when no sources match", () => {
    const result = detectLanguage({
      supportedLanguages: ["en", "es"],
      defaultLanguage: "en",
      sources: [],
    });
    expect(result).toBe("en");
  });

  test("detects from navigator.languages", () => {
    Object.defineProperty(globalThis, "navigator", {
      value: { languages: ["fr-FR", "en-US"], language: "fr-FR" },
      configurable: true,
    });

    const result = detectLanguage({
      supportedLanguages: ["en", "es", "fr"],
      defaultLanguage: "en",
      sources: ["navigator"],
    });
    expect(result).toBe("fr");
  });

  test("detects from navigator.language fallback", () => {
    Object.defineProperty(globalThis, "navigator", {
      value: { language: "es" },
      configurable: true,
    });

    const result = detectLanguage({
      supportedLanguages: ["en", "es"],
      defaultLanguage: "en",
      sources: ["navigator"],
    });
    expect(result).toBe("es");
  });

  test("skips unsupported navigator languages", () => {
    Object.defineProperty(globalThis, "navigator", {
      value: { languages: ["de", "ja", "es"], language: "de" },
      configurable: true,
    });

    const result = detectLanguage({
      supportedLanguages: ["en", "es"],
      defaultLanguage: "en",
      sources: ["navigator"],
    });
    expect(result).toBe("es");
  });

  test("detects from html lang attribute", () => {
    Object.defineProperty(globalThis, "document", {
      value: { documentElement: { lang: "es" }, cookie: "" },
      configurable: true,
    });

    const result = detectLanguage({
      supportedLanguages: ["en", "es"],
      defaultLanguage: "en",
      sources: ["htmlLang"],
    });
    expect(result).toBe("es");
  });

  test("detects from localStorage", () => {
    const store: Record<string, string> = { "t9nkit-lang": "fr" };
    Object.defineProperty(globalThis, "localStorage", {
      value: {
        getItem: (key: string) => store[key] ?? null,
        setItem: (key: string, val: string) => {
          store[key] = val;
        },
      },
      configurable: true,
    });

    const result = detectLanguage({
      supportedLanguages: ["en", "es", "fr"],
      defaultLanguage: "en",
      sources: ["localStorage"],
    });
    expect(result).toBe("fr");
  });

  test("detects from localStorage with custom key", () => {
    const store: Record<string, string> = { "my-lang": "es" };
    Object.defineProperty(globalThis, "localStorage", {
      value: {
        getItem: (key: string) => store[key] ?? null,
        setItem: () => {},
      },
      configurable: true,
    });

    const result = detectLanguage({
      supportedLanguages: ["en", "es"],
      defaultLanguage: "en",
      sources: ["localStorage"],
      localStorageKey: "my-lang",
    });
    expect(result).toBe("es");
  });

  test("detects from cookie", () => {
    Object.defineProperty(globalThis, "document", {
      value: {
        cookie: "other=val; t9nkit-lang=es; another=x",
        documentElement: { lang: "" },
      },
      configurable: true,
    });

    const result = detectLanguage({
      supportedLanguages: ["en", "es"],
      defaultLanguage: "en",
      sources: ["cookie"],
    });
    expect(result).toBe("es");
  });

  test("detects from querystring", () => {
    Object.defineProperty(globalThis, "location", {
      value: { href: "https://example.com/page?lang=fr&other=1" },
      configurable: true,
    });

    const result = detectLanguage({
      supportedLanguages: ["en", "es", "fr"],
      defaultLanguage: "en",
      sources: ["querystring"],
    });
    expect(result).toBe("fr");
  });

  test("detects from pathname /es/", () => {
    Object.defineProperty(globalThis, "location", {
      value: { href: "https://example.com/es/about" },
      configurable: true,
    });

    const result = detectLanguage({
      supportedLanguages: ["en", "es", "fr"],
      defaultLanguage: "en",
      sources: ["pathname"],
    });
    expect(result).toBe("es");
  });

  test("detects from pathname /en without trailing slash", () => {
    Object.defineProperty(globalThis, "location", {
      value: { href: "https://example.com/en" },
      configurable: true,
    });

    const result = detectLanguage({
      supportedLanguages: ["en", "es"],
      defaultLanguage: "es",
      sources: ["pathname"],
    });
    expect(result).toBe("en");
  });

  test("pathname ignores non-language segments", () => {
    Object.defineProperty(globalThis, "location", {
      value: { href: "https://example.com/dashboard/settings" },
      configurable: true,
    });

    const result = detectLanguage({
      supportedLanguages: ["en", "es"],
      defaultLanguage: "en",
      sources: ["pathname"],
    });
    expect(result).toBe("en"); // falls back to default
  });

  test("pathname matches base language from region code", () => {
    Object.defineProperty(globalThis, "location", {
      value: { href: "https://example.com/en-US/dashboard" },
      configurable: true,
    });

    const result = detectLanguage({
      supportedLanguages: ["en", "es", "fr"],
      defaultLanguage: "es",
      sources: ["pathname"],
    });
    expect(result).toBe("en");
  });

  test("respects source priority order", () => {
    const store: Record<string, string> = { "t9nkit-lang": "fr" };
    Object.defineProperty(globalThis, "localStorage", {
      value: {
        getItem: (key: string) => store[key] ?? null,
        setItem: () => {},
      },
      configurable: true,
    });
    Object.defineProperty(globalThis, "navigator", {
      value: { languages: ["es"], language: "es" },
      configurable: true,
    });

    // localStorage before navigator -> fr wins
    const result1 = detectLanguage({
      supportedLanguages: ["en", "es", "fr"],
      defaultLanguage: "en",
      sources: ["localStorage", "navigator"],
    });
    expect(result1).toBe("fr");

    // navigator before localStorage -> es wins
    const result2 = detectLanguage({
      supportedLanguages: ["en", "es", "fr"],
      defaultLanguage: "en",
      sources: ["navigator", "localStorage"],
    });
    expect(result2).toBe("es");
  });

  test("uses default sources when none specified", () => {
    // With no browser globals available, should return default
    const result = detectLanguage({
      supportedLanguages: ["en", "es"],
      defaultLanguage: "en",
    });
    // In bun test environment, navigator exists but may not match
    // The important thing is it doesn't throw
    expect(["en", "es"]).toContain(result);
  });
});

describe("persistLanguage", () => {
  test("saves to localStorage by default", () => {
    const store: Record<string, string> = {};
    Object.defineProperty(globalThis, "localStorage", {
      value: {
        getItem: (key: string) => store[key] ?? null,
        setItem: (key: string, val: string) => {
          store[key] = val;
        },
      },
      configurable: true,
    });

    persistLanguage("es");
    expect(store["t9nkit-lang"]).toBe("es");
  });

  test("saves to localStorage with custom key", () => {
    const store: Record<string, string> = {};
    Object.defineProperty(globalThis, "localStorage", {
      value: {
        getItem: (key: string) => store[key] ?? null,
        setItem: (key: string, val: string) => {
          store[key] = val;
        },
      },
      configurable: true,
    });

    persistLanguage("fr", { localStorageKey: "app-locale" });
    expect(store["app-locale"]).toBe("fr");
  });

  test("saves to cookie when enabled", () => {
    let cookieValue = "";
    Object.defineProperty(globalThis, "document", {
      value: {
        get cookie() {
          return cookieValue;
        },
        set cookie(v: string) {
          cookieValue = v;
        },
        documentElement: { lang: "" },
      },
      configurable: true,
    });

    persistLanguage("es", { cookie: true, localStorage: false });
    expect(cookieValue).toContain("t9nkit-lang=es");
    expect(cookieValue).toContain("SameSite=Lax");
  });

  test("does not throw in SSR environment", () => {
    // This should not throw even without browser globals
    expect(() => persistLanguage("en")).not.toThrow();
  });
});
