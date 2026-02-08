import { describe, test, expect, beforeEach } from "bun:test";
import { T9nKit, createTranslator } from "./translator";
import type { T9nKitConfig, TranslationValue } from "./types";

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

describe("Namespaces", () => {
  let warnCalls: string[];
  let originalWarn: typeof console.warn;

  beforeEach(() => {
    warnCalls = [];
    originalWarn = console.warn;
    console.warn = (msg: string) => {
      warnCalls.push(msg);
    };
  });

  const nsConfig: T9nKitConfig<"en" | "es"> = {
    translations: {
      en: { greeting: "Hello" },
      es: { greeting: "Hola" },
    },
    defaultLanguage: "es",
    namespaces: {
      auth: {
        en: { login: "Log in", logout: "Log out" },
        es: { login: "Iniciar sesión", logout: "Cerrar sesión" },
      },
      dashboard: {
        en: { title: "Dashboard", welcome: "Welcome, {name}!" },
        es: { title: "Panel", welcome: "Bienvenido, {name}!" },
      },
    },
  };

  test("translates namespaced keys with colon syntax", () => {
    const kit = new T9nKit(nsConfig);
    kit.setLanguage("es");
    console.warn = originalWarn;
    expect(kit.translate("auth:login")).toBe("Iniciar sesión");
    expect(kit.translate("auth:logout")).toBe("Cerrar sesión");
    expect(kit.translate("dashboard:title")).toBe("Panel");
  });

  test("translates top-level keys without namespace", () => {
    const kit = new T9nKit(nsConfig);
    kit.setLanguage("es");
    console.warn = originalWarn;
    expect(kit.translate("greeting")).toBe("Hola");
  });

  test("supports interpolation in namespaced keys", () => {
    const kit = new T9nKit(nsConfig);
    kit.setLanguage("en");
    console.warn = originalWarn;
    expect(kit.translate("dashboard:welcome", { name: "Alice" })).toBe(
      "Welcome, Alice!",
    );
  });

  test("falls back to default language in namespace", () => {
    const config: T9nKitConfig<"en" | "es"> = {
      translations: { en: {}, es: {} },
      defaultLanguage: "es",
      namespaces: {
        auth: {
          en: {},
          es: { login: "Iniciar sesión" },
        },
      },
    };
    const kit = new T9nKit(config);
    kit.setLanguage("en");
    console.warn = originalWarn;
    expect(kit.translate("auth:login")).toBe("Iniciar sesión");
  });

  test("returns key when namespaced translation not found", () => {
    const kit = new T9nKit(nsConfig);
    kit.translate("auth:nonexistent");
    console.warn = originalWarn;
    expect(warnCalls.some((w) => w.includes("missing"))).toBe(true);
  });

  test("hasTranslation works with namespaced keys", () => {
    const kit = new T9nKit(nsConfig);
    console.warn = originalWarn;
    expect(kit.hasTranslation("auth:login")).toBe(true);
    expect(kit.hasTranslation("auth:nonexistent")).toBe(false);
  });

  test("getTranslation works with namespaced keys", () => {
    const kit = new T9nKit(nsConfig);
    kit.setLanguage("en");
    console.warn = originalWarn;
    expect(kit.getTranslation("dashboard:welcome")).toBe("Welcome, {name}!");
  });

  test("addNamespace adds a new namespace at runtime", () => {
    const kit = new T9nKit(nsConfig);
    kit.setLanguage("en");
    kit.addNamespace("settings", {
      en: { theme: "Theme" },
      es: { theme: "Tema" },
    } as Record<"en" | "es", Record<string, TranslationValue>>);
    console.warn = originalWarn;
    expect(kit.translate("settings:theme")).toBe("Theme");
    expect(kit.hasNamespace("settings")).toBe(true);
  });

  test("addNamespace merges into existing namespace", () => {
    const kit = new T9nKit(nsConfig);
    kit.setLanguage("en");
    kit.addNamespace("auth", {
      en: { register: "Register" },
      es: { register: "Registrarse" },
    } as Record<"en" | "es", Record<string, TranslationValue>>);
    console.warn = originalWarn;
    // New key
    expect(kit.translate("auth:register")).toBe("Register");
    // Old key still works
    expect(kit.translate("auth:login")).toBe("Log in");
  });

  test("removeNamespace removes a namespace", () => {
    const kit = new T9nKit(nsConfig);
    kit.removeNamespace("auth");
    console.warn = originalWarn;
    expect(kit.hasNamespace("auth")).toBe(false);
    expect(kit.translate("auth:login")).toBe("auth:login");
  });

  test("getNamespaces returns all loaded namespaces", () => {
    const kit = new T9nKit(nsConfig);
    console.warn = originalWarn;
    const ns = kit.getNamespaces();
    expect(ns).toContain("auth");
    expect(ns).toContain("dashboard");
    expect(ns.length).toBe(2);
  });

  test("defaultNamespace resolves keys without colon", () => {
    const config: T9nKitConfig<"en" | "es"> = {
      translations: { en: {}, es: {} },
      defaultLanguage: "en",
      defaultNamespace: "common",
      namespaces: {
        common: {
          en: { hello: "Hello from NS" },
          es: { hello: "Hola desde NS" },
        },
      },
    };
    const kit = new T9nKit(config);
    kit.setLanguage("en");
    console.warn = originalWarn;
    expect(kit.translate("hello")).toBe("Hello from NS");
  });

  test("top-level translations still work when defaultNamespace is set", () => {
    const config: T9nKitConfig<"en" | "es"> = {
      translations: {
        en: { fallback: "From top-level" },
        es: { fallback: "Desde nivel superior" },
      },
      defaultLanguage: "en",
      defaultNamespace: "common",
      namespaces: {
        common: {
          en: { hello: "Hello" },
          es: { hello: "Hola" },
        },
      },
    };
    const kit = new T9nKit(config);
    kit.setLanguage("en");
    console.warn = originalWarn;
    // Key in default namespace
    expect(kit.translate("hello")).toBe("Hello");
    // Key not in default namespace, falls back to top-level
    expect(kit.translate("fallback")).toBe("From top-level");
  });

  test("createTranslator exposes namespace methods", () => {
    const { t, addNamespace, hasNamespace, getNamespaces, removeNamespace } =
      createTranslator(nsConfig, "en");
    console.warn = originalWarn;

    expect(t("auth:login")).toBe("Log in");
    expect(hasNamespace("auth")).toBe(true);
    expect(getNamespaces()).toContain("auth");

    addNamespace("extra", {
      en: { test: "Test" },
      es: { test: "Prueba" },
    } as Record<"en" | "es", Record<string, TranslationValue>>);
    expect(t("extra:test")).toBe("Test");

    removeNamespace("extra");
    expect(hasNamespace("extra")).toBe(false);
  });
});

describe("Lazy Loading", () => {
  let warnCalls: string[];
  let originalWarn: typeof console.warn;

  beforeEach(() => {
    warnCalls = [];
    originalWarn = console.warn;
    console.warn = (msg: string) => {
      warnCalls.push(msg);
    };
  });

  test("loads namespace and translates after loading", async () => {
    const config: T9nKitConfig<"en" | "es"> = {
      translations: { en: {}, es: {} },
      defaultLanguage: "en",
      lazyNamespaces: {
        lazy: async (lang) => {
          if (lang === "en") return { title: "Lazy Title" };
          return { title: "Título Lazy" };
        },
      },
    };
    const kit = new T9nKit(config);
    kit.setLanguage("en");

    // Before loading — returns key
    expect(kit.translate("lazy:title")).toBe("lazy:title");

    await kit.loadNamespace("lazy");
    console.warn = originalWarn;
    expect(kit.translate("lazy:title")).toBe("Lazy Title");
  });

  test("deduplicates concurrent loads", async () => {
    let loadCount = 0;
    const config: T9nKitConfig<"en" | "es"> = {
      translations: { en: {}, es: {} },
      defaultLanguage: "en",
      lazyNamespaces: {
        dedup: async () => {
          loadCount++;
          return { key: "value" };
        },
      },
    };
    const kit = new T9nKit(config);

    // Fire multiple concurrent loads
    const p1 = kit.loadNamespace("dedup");
    const p2 = kit.loadNamespace("dedup");
    const p3 = kit.loadNamespace("dedup");
    await Promise.all([p1, p2, p3]);
    console.warn = originalWarn;

    expect(loadCount).toBe(1);
    expect(kit.translate("dedup:key")).toBe("value");
  });

  test("isNamespaceLoaded tracks state", async () => {
    const config: T9nKitConfig<"en" | "es"> = {
      translations: { en: {}, es: {} },
      defaultLanguage: "en",
      lazyNamespaces: {
        track: async () => ({ key: "val" }),
      },
    };
    const kit = new T9nKit(config);

    expect(kit.isNamespaceLoaded("track")).toBe(false);
    await kit.loadNamespace("track");
    console.warn = originalWarn;
    expect(kit.isNamespaceLoaded("track")).toBe(true);
  });

  test("loads per language", async () => {
    const config: T9nKitConfig<"en" | "es"> = {
      translations: { en: {}, es: {} },
      defaultLanguage: "en",
      lazyNamespaces: {
        perLang: async (lang) => {
          if (lang === "en") return { word: "Hello" };
          return { word: "Hola" };
        },
      },
    };
    const kit = new T9nKit(config);

    await kit.loadNamespace("perLang", "en");
    await kit.loadNamespace("perLang", "es");
    console.warn = originalWarn;

    kit.setLanguage("en");
    expect(kit.translate("perLang:word")).toBe("Hello");

    kit.setLanguage("es");
    expect(kit.translate("perLang:word")).toBe("Hola");
  });

  test("loadNamespaces loads multiple at once", async () => {
    const config: T9nKitConfig<"en" | "es"> = {
      translations: { en: {}, es: {} },
      defaultLanguage: "en",
      lazyNamespaces: {
        ns1: async () => ({ a: "A" }),
        ns2: async () => ({ b: "B" }),
      },
    };
    const kit = new T9nKit(config);

    await kit.loadNamespaces(["ns1", "ns2"]);
    console.warn = originalWarn;

    expect(kit.translate("ns1:a")).toBe("A");
    expect(kit.translate("ns2:b")).toBe("B");
  });

  test("registerLoader adds loader at runtime", async () => {
    const config: T9nKitConfig<"en" | "es"> = {
      translations: { en: {}, es: {} },
      defaultLanguage: "en",
    };
    const kit = new T9nKit(config);

    kit.registerLoader("runtime", async () => ({ msg: "Dynamic" }));
    await kit.loadNamespace("runtime");
    console.warn = originalWarn;

    expect(kit.translate("runtime:msg")).toBe("Dynamic");
  });

  test("handles loader errors gracefully", async () => {
    const config: T9nKitConfig<"en" | "es"> = {
      translations: { en: {}, es: {} },
      defaultLanguage: "en",
      lazyNamespaces: {
        broken: async () => {
          throw new Error("Network error");
        },
      },
    };
    const kit = new T9nKit(config);

    let threw = false;
    try {
      await kit.loadNamespace("broken");
    } catch {
      threw = true;
    }
    console.warn = originalWarn;

    expect(threw).toBe(true);
    // Should not be marked as loaded
    expect(kit.isNamespaceLoaded("broken")).toBe(false);
  });

  test("createTranslator exposes lazy loading methods", async () => {
    const config: T9nKitConfig<"en" | "es"> = {
      translations: { en: {}, es: {} },
      defaultLanguage: "en",
      lazyNamespaces: {
        api: async () => ({ endpoint: "/api" }),
      },
    };
    const {
      t,
      loadNamespace,
      loadNamespaces,
      isNamespaceLoaded,
      registerLoader,
    } = createTranslator(config, "en");

    expect(isNamespaceLoaded("api")).toBe(false);
    await loadNamespace("api");
    console.warn = originalWarn;
    expect(isNamespaceLoaded("api")).toBe(true);
    expect(t("api:endpoint")).toBe("/api");

    registerLoader("extra", async () => ({ x: "X" }));
    await loadNamespaces(["extra"]);
    expect(t("extra:x")).toBe("X");
  });
});
