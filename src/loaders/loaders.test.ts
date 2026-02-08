import { describe, it, expect } from "bun:test";
import {
  loadJsonTranslations,
  loadNamespacedJsonTranslations,
} from "./json-loader";
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
      },
    );

    expect(config.languages).toEqual({ en: "English" });
    expect(config.warnOnMissing).toBe(false);
  });
});

describe("Namespaced JSON Loader", () => {
  it("should load namespaced translations", () => {
    const config = loadNamespacedJsonTranslations(
      {
        auth: {
          en: { login: "Log in", logout: "Log out" },
          es: { login: "Iniciar sesión", logout: "Cerrar sesión" },
        },
        dashboard: {
          en: { title: "Dashboard" },
          es: { title: "Panel" },
        },
      },
      { defaultLanguage: "en" },
    );

    const { t } = createTranslator(config, "en");
    expect(t("auth:login")).toBe("Log in");
    expect(t("dashboard:title")).toBe("Dashboard");
  });

  it("should support defaultNamespace", () => {
    const config = loadNamespacedJsonTranslations(
      {
        common: {
          en: { hello: "Hello" },
          es: { hello: "Hola" },
        },
      },
      { defaultLanguage: "en", defaultNamespace: "common" },
    );

    const { t } = createTranslator(config, "en");
    expect(t("hello")).toBe("Hello");
  });

  it("should handle nested + plural inside namespaces", () => {
    const config = loadNamespacedJsonTranslations(
      {
        shop: {
          en: {
            cart: {
              items: { zero: "Empty", one: "1 item", other: "{count} items" },
            },
          },
          es: {
            cart: {
              items: {
                zero: "Vacío",
                one: "1 artículo",
                other: "{count} artículos",
              },
            },
          },
        },
      },
      { defaultLanguage: "en" },
    );

    const { t } = createTranslator(config, "en");
    expect(t("shop:cart.items", { count: 0 })).toBe("Empty");
    expect(t("shop:cart.items", { count: 1 })).toBe("1 item");
    expect(t("shop:cart.items", { count: 5 })).toBe("5 items");
  });

  it("should pass through loader options", () => {
    const config = loadNamespacedJsonTranslations(
      {
        ns: { en: { key: "val" } },
      },
      {
        defaultLanguage: "en",
        languages: { en: "English" },
        warnOnMissing: false,
      },
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
});
