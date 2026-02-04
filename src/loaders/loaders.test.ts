import { describe, it, expect } from "bun:test";
import { loadJsonTranslations } from "./json-loader";
import { loadArbTranslations } from "./arb-loader";
import { createTranslator } from "../core";

describe("JSON Loader", () => {
  it("should load simple string translations", () => {
    const en = {
      greeting: "Hello",
      farewell: "Goodbye",
    };
    const es = {
      greeting: "Hola",
      farewell: "Adiós",
    };

    const config = loadJsonTranslations({ en, es }, { defaultLanguage: "es" });

    expect(config.translations.en.greeting).toBe("Hello");
    expect(config.translations.es.greeting).toBe("Hola");
    expect(config.defaultLanguage).toBe("es");
  });

  it("should load translations with interpolation", () => {
    const en = {
      welcome: "Welcome, {name}!",
    };
    const es = {
      welcome: "¡Bienvenido, {name}!",
    };

    const config = loadJsonTranslations({ en, es }, { defaultLanguage: "en" });
    const { t } = createTranslator(config, "es");

    expect(t("welcome", { name: "Juan" })).toBe("¡Bienvenido, Juan!");
  });

  it("should load plural translations", () => {
    const en = {
      items: {
        zero: "No items",
        one: "1 item",
        other: "{count} items",
      },
    };
    const es = {
      items: {
        zero: "Sin artículos",
        one: "1 artículo",
        other: "{count} artículos",
      },
    };

    const config = loadJsonTranslations({ en, es }, { defaultLanguage: "en" });
    const { t } = createTranslator(config, "en");

    expect(t("items", { count: 0 })).toBe("No items");
    expect(t("items", { count: 1 })).toBe("1 item");
    expect(t("items", { count: 5 })).toBe("5 items");
  });

  it("should load nested translations", () => {
    const en = {
      nav: {
        home: "Home",
        about: "About",
        contact: {
          email: "Email",
          phone: "Phone",
        },
      },
    };

    const config = loadJsonTranslations({ en }, { defaultLanguage: "en" });
    const { t } = createTranslator(config, "en");

    expect(t("nav.home")).toBe("Home");
    expect(t("nav.contact.email")).toBe("Email");
  });

  it("should pass through loader options", () => {
    const en = { greeting: "Hello" };

    const config = loadJsonTranslations(
      { en },
      {
        defaultLanguage: "en",
        languages: { en: "English" },
        warnOnMissing: false,
      }
    );

    expect(config.languages).toEqual({ en: "English" });
    expect(config.warnOnMissing).toBe(false);
  });
});

describe("ARB Loader", () => {
  it("should load simple string translations", () => {
    const en = {
      "@@locale": "en",
      greeting: "Hello",
      farewell: "Goodbye",
    };
    const es = {
      "@@locale": "es",
      greeting: "Hola",
      farewell: "Adiós",
    };

    const config = loadArbTranslations({ en, es }, { defaultLanguage: "es" });

    expect(config.translations.en.greeting).toBe("Hello");
    expect(config.translations.es.greeting).toBe("Hola");
  });

  it("should ignore ARB metadata keys", () => {
    const en = {
      "@@locale": "en",
      "@@last_modified": "2024-01-01",
      greeting: "Hello, {name}!",
      "@greeting": {
        description: "Greeting message",
        placeholders: {
          name: { type: "String" },
        },
      },
    };

    const config = loadArbTranslations({ en }, { defaultLanguage: "en" });

    expect(config.translations.en["@@locale"]).toBeUndefined();
    expect(config.translations.en["@greeting"]).toBeUndefined();
    expect(config.translations.en.greeting).toBe("Hello, {name}!");
  });

  it("should handle interpolation (same format as t9nKit)", () => {
    const en = {
      welcome: "Welcome, {name}!",
    };
    const es = {
      welcome: "¡Bienvenido, {name}!",
    };

    const config = loadArbTranslations({ en, es }, { defaultLanguage: "en" });
    const { t } = createTranslator(config, "es");

    expect(t("welcome", { name: "María" })).toBe("¡Bienvenido, María!");
  });

  it("should parse ICU plural syntax", () => {
    const en = {
      itemCount:
        "{count, plural, zero{No items} one{1 item} other{{count} items}}",
    };

    const config = loadArbTranslations({ en }, { defaultLanguage: "en" });
    const { t } = createTranslator(config, "en");

    expect(t("itemCount", { count: 0 })).toBe("No items");
    expect(t("itemCount", { count: 1 })).toBe("1 item");
    expect(t("itemCount", { count: 42 })).toBe("42 items");
  });

  it("should parse ICU plural with =N syntax", () => {
    const en = {
      itemCount: "{n, plural, =0{Empty} =1{One} other{{n} total}}",
    };

    const config = loadArbTranslations({ en }, { defaultLanguage: "en" });

    // Check the parsed structure
    const plural = config.translations.en.itemCount as {
      zero?: string;
      one: string;
      other: string;
    };
    expect(plural.zero).toBe("Empty");
    expect(plural.one).toBe("One");
    expect(plural.other).toBe("{count} total");
  });

  it("should handle complex ARB file", () => {
    const en = {
      "@@locale": "en",
      appTitle: "My App",
      "@appTitle": {
        description: "The title of the application",
      },
      welcomeMessage: "Welcome back, {username}!",
      "@welcomeMessage": {
        description: "Welcome message shown on home screen",
        placeholders: {
          username: {
            type: "String",
            example: "John",
          },
        },
      },
      notifications:
        "{count, plural, zero{No notifications} one{1 notification} other{{count} notifications}}",
      "@notifications": {
        description: "Notification count",
        placeholders: {
          count: {
            type: "int",
          },
        },
      },
    };

    const config = loadArbTranslations({ en }, { defaultLanguage: "en" });
    const { t } = createTranslator(config, "en");

    expect(t("appTitle")).toBe("My App");
    expect(t("welcomeMessage", { username: "Alice" })).toBe(
      "Welcome back, Alice!"
    );
    expect(t("notifications", { count: 0 })).toBe("No notifications");
    expect(t("notifications", { count: 1 })).toBe("1 notification");
    expect(t("notifications", { count: 5 })).toBe("5 notifications");
  });

  it("should pass through loader options", () => {
    const en = { greeting: "Hello" };

    const config = loadArbTranslations(
      { en },
      {
        defaultLanguage: "en",
        languages: { en: "English" },
        warnOnMissing: false,
      }
    );

    expect(config.languages).toEqual({ en: "English" });
    expect(config.warnOnMissing).toBe(false);
  });
});

describe("Integration with createTranslator", () => {
  it("should work seamlessly with JSON loaded config", () => {
    const translations = {
      en: {
        hello: "Hello",
        items: { one: "item", other: "items" },
      },
      es: {
        hello: "Hola",
        items: { one: "artículo", other: "artículos" },
      },
    };

    const config = loadJsonTranslations(translations, {
      defaultLanguage: "es",
      languages: { en: "English", es: "Español" },
    });

    const { t, getLanguage, setLanguage } = createTranslator(config, "es");

    expect(getLanguage()).toBe("es");
    expect(t("hello")).toBe("Hola");

    setLanguage("en");
    expect(t("hello")).toBe("Hello");
  });

  it("should work seamlessly with ARB loaded config", () => {
    const translations = {
      en: {
        "@@locale": "en",
        hello: "Hello",
        count: "{n, plural, one{1 thing} other{{n} things}}",
      },
      es: {
        "@@locale": "es",
        hello: "Hola",
        count: "{n, plural, one{1 cosa} other{{n} cosas}}",
      },
    };

    const config = loadArbTranslations(translations, {
      defaultLanguage: "es",
    });

    const { t } = createTranslator(config, "en");

    expect(t("hello")).toBe("Hello");
    expect(t("count", { count: 1 })).toBe("1 thing");
    expect(t("count", { count: 3 })).toBe("3 things");
  });
});
