import { describe, test, expect } from "bun:test";
import {
  getLangFromUrl,
  useTranslations,
  getTranslation,
  hasTranslation,
  generateAlternateLinks,
  createLanguageSwitcher,
} from "./astro";
import type { T9nKitConfig } from "./core";

const testConfig: T9nKitConfig<"es" | "en" | "fr"> = {
  translations: {
    es: {
      hello: "Hola",
      welcome: "Bienvenido, {name}",
      meta: {
        title: "Mi Sitio Web",
      },
      nav: {
        home: "Inicio",
      },
    },
    en: {
      hello: "Hello",
      welcome: "Welcome, {name}",
      meta: {
        title: "My Website",
      },
      nav: {
        home: "Home",
      },
    },
    fr: {
      hello: "Bonjour",
      welcome: "Bienvenue, {name}",
      meta: {
        title: "Mon Site Web",
      },
      nav: {
        home: "Accueil",
      },
    },
  },
  defaultLanguage: "es",
  languages: {
    es: "Español",
    en: "English",
    fr: "Français",
  },
};

describe("getLangFromUrl", () => {
  test("extracts language from URL with prefix", () => {
    const url = new URL("https://example.com/es/page");
    const lang = getLangFromUrl(url, ["es", "en"], "es");
    expect(lang).toBe("es");
  });

  test("extracts different language from URL", () => {
    const url = new URL("https://example.com/en/blog/post");
    const lang = getLangFromUrl(url, ["es", "en"], "es");
    expect(lang).toBe("en");
  });

  test("returns default language for URL without prefix", () => {
    const url = new URL("https://example.com/page");
    const lang = getLangFromUrl(url, ["es", "en"], "es");
    expect(lang).toBe("es");
  });

  test("returns default language for root URL", () => {
    const url = new URL("https://example.com/");
    const lang = getLangFromUrl(url, ["es", "en"], "es");
    expect(lang).toBe("es");
  });

  test("returns default language for unsupported language", () => {
    const url = new URL("https://example.com/de/page");
    const lang = getLangFromUrl(url, ["es", "en"], "es");
    expect(lang).toBe("es");
  });

  test("handles multiple supported languages", () => {
    const url = new URL("https://example.com/fr/page");
    const lang = getLangFromUrl(url, ["es", "en", "fr"], "es");
    expect(lang).toBe("fr");
  });
});

describe("useTranslations", () => {
  test("returns translator functions", () => {
    const translator = useTranslations(testConfig, "es");
    expect(translator.t).toBeDefined();
    expect(translator.tn).toBeDefined();
    expect(translator.td).toBeDefined();
    expect(translator.tc).toBeDefined();
    expect(translator.tr).toBeDefined();
  });

  test("translates correctly for specified language", () => {
    const { t } = useTranslations(testConfig, "es");
    expect(t("hello")).toBe("Hola");
  });

  test("translates correctly for different language", () => {
    const { t } = useTranslations(testConfig, "en");
    expect(t("hello")).toBe("Hello");
  });

  test("handles interpolation", () => {
    const { t } = useTranslations(testConfig, "es");
    expect(t("welcome", { name: "Franz" })).toBe("Bienvenido, Franz");
  });

  test("handles nested keys", () => {
    const { t } = useTranslations(testConfig, "es");
    expect(t("nav.home")).toBe("Inicio");
  });

  test("formats numbers", () => {
    const { tn } = useTranslations(testConfig, "es");
    const result = tn(1234.56);
    expect(result).toBe("1234,56");
  });

  test("formats dates", () => {
    const { td } = useTranslations(testConfig, "es");
    const result = td(new Date("2026-01-15"));
    expect(result).toContain("enero");
  });
});

describe("getTranslation", () => {
  test("returns raw translation for key", () => {
    const translation = getTranslation("meta.title", testConfig, "es");
    expect(translation).toBe("Mi Sitio Web");
  });

  test("returns translation for different language", () => {
    const translation = getTranslation("meta.title", testConfig, "en");
    expect(translation).toBe("My Website");
  });

  test("returns translation without interpolation", () => {
    const translation = getTranslation("welcome", testConfig, "es");
    expect(translation).toBe("Bienvenido, {name}");
  });

  test("uses default language when not specified", () => {
    const translation = getTranslation("meta.title", testConfig);
    expect(translation).toBe("Mi Sitio Web");
  });
});

describe("hasTranslation", () => {
  test("returns true for existing key", () => {
    expect(hasTranslation("hello", testConfig, "es")).toBe(true);
  });

  test("returns false for missing key", () => {
    expect(hasTranslation("nonexistent", testConfig, "es")).toBe(false);
  });

  test("checks different languages", () => {
    expect(hasTranslation("hello", testConfig, "en")).toBe(true);
    expect(hasTranslation("hello", testConfig, "fr")).toBe(true);
  });

  test("checks nested keys", () => {
    expect(hasTranslation("nav.home", testConfig, "es")).toBe(true);
  });
});

describe("generateAlternateLinks", () => {
  test("generates links for all languages from root", () => {
    const url = new URL("https://example.com/");
    const links = generateAlternateLinks(url, ["es", "en"], "es");

    expect(links).toHaveLength(2);
    expect(links[0]).toEqual({ lang: "es", url: "https://example.com/" });
    expect(links[1]).toEqual({ lang: "en", url: "https://example.com/en/" });
  });

  test("generates links for all languages from language-prefixed URL", () => {
    const url = new URL("https://example.com/en/blog/post");
    const links = generateAlternateLinks(url, ["es", "en"], "es");

    expect(links).toHaveLength(2);
    expect(links[0]).toEqual({
      lang: "es",
      url: "https://example.com/blog/post",
    });
    expect(links[1]).toEqual({
      lang: "en",
      url: "https://example.com/en/blog/post",
    });
  });

  test("generates links from default language URL", () => {
    const url = new URL("https://example.com/blog/post");
    const links = generateAlternateLinks(url, ["es", "en"], "es");

    expect(links).toHaveLength(2);
    expect(links[0]).toEqual({
      lang: "es",
      url: "https://example.com/blog/post",
    });
    expect(links[1]).toEqual({
      lang: "en",
      url: "https://example.com/en/blog/post",
    });
  });

  test("preserves query parameters", () => {
    const url = new URL("https://example.com/en/page?foo=bar");
    const links = generateAlternateLinks(url, ["es", "en"], "es");

    expect(links[0].url).toBe("https://example.com/page?foo=bar");
    expect(links[1].url).toBe("https://example.com/en/page?foo=bar");
  });

  test("handles multiple languages", () => {
    const url = new URL("https://example.com/fr/page");
    const links = generateAlternateLinks(url, ["es", "en", "fr"], "es");

    expect(links).toHaveLength(3);
    expect(links[0].lang).toBe("es");
    expect(links[1].lang).toBe("en");
    expect(links[2].lang).toBe("fr");
  });

  test("handles nested paths", () => {
    const url = new URL("https://example.com/en/blog/2026/01/post");
    const links = generateAlternateLinks(url, ["es", "en"], "es");

    expect(links[0].url).toBe("https://example.com/blog/2026/01/post");
    expect(links[1].url).toBe("https://example.com/en/blog/2026/01/post");
  });
});

describe("createLanguageSwitcher", () => {
  test("returns current language and alternatives", () => {
    const url = new URL("https://example.com/es/page");
    const switcher = createLanguageSwitcher(
      url,
      ["es", "en"],
      "es",
      testConfig.languages,
    );

    expect(switcher.current.code).toBe("es");
    expect(switcher.current.name).toBe("Español");
    expect(switcher.alternatives).toHaveLength(1);
    expect(switcher.alternatives[0].code).toBe("en");
  });

  test("provides correct URLs for alternatives", () => {
    const url = new URL("https://example.com/es/blog/post");
    const switcher = createLanguageSwitcher(
      url,
      ["es", "en"],
      "es",
      testConfig.languages,
    );

    expect(switcher.alternatives[0].url).toBe(
      "https://example.com/en/blog/post",
    );
  });

  test("handles default language URL", () => {
    const url = new URL("https://example.com/page");
    const switcher = createLanguageSwitcher(
      url,
      ["es", "en"],
      "es",
      testConfig.languages,
    );

    expect(switcher.current.code).toBe("es");
    expect(switcher.alternatives[0].code).toBe("en");
  });

  test("provides language names", () => {
    const url = new URL("https://example.com/en/page");
    const switcher = createLanguageSwitcher(
      url,
      ["es", "en"],
      "es",
      testConfig.languages,
    );

    expect(switcher.current.name).toBe("English");
    expect(switcher.alternatives[0].name).toBe("Español");
  });

  test("uses language codes as fallback names", () => {
    const url = new URL("https://example.com/es/page");
    const switcher = createLanguageSwitcher(url, ["es", "en"], "es");

    expect(switcher.current.name).toBe("es");
    expect(switcher.alternatives[0].name).toBe("en");
  });

  test("handles multiple alternatives", () => {
    const url = new URL("https://example.com/es/page");
    const switcher = createLanguageSwitcher(
      url,
      ["es", "en", "fr"],
      "es",
      testConfig.languages,
    );

    expect(switcher.alternatives).toHaveLength(2);
    expect(switcher.alternatives.map((a) => a.code)).toEqual(["en", "fr"]);
  });

  test("excludes current language from alternatives", () => {
    const url = new URL("https://example.com/fr/page");
    const switcher = createLanguageSwitcher(
      url,
      ["es", "en", "fr"],
      "es",
      testConfig.languages,
    );

    expect(switcher.current.code).toBe("fr");
    expect(switcher.alternatives.map((a) => a.code)).toEqual(["es", "en"]);
  });
});
