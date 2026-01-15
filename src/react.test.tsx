import { describe, test, expect } from "bun:test";
import React from "react";
import { renderToString } from "react-dom/server";
import {
  TranslationProvider,
  useTranslation,
  createReactTranslator,
} from "./react";
import type { T9nKitConfig } from "./core";

// Test configuration
const testConfig: T9nKitConfig<"es" | "en"> = {
  translations: {
    es: {
      hello: "Hola",
      welcome: "Bienvenido, {name}",
      nav: {
        home: "Inicio",
      },
      items: {
        zero: "Sin artículos",
        one: "1 artículo",
        other: "{count} artículos",
      },
    },
    en: {
      hello: "Hello",
      welcome: "Welcome, {name}",
      nav: {
        home: "Home",
      },
      items: {
        zero: "No items",
        one: "1 item",
        other: "{count} items",
      },
    },
  },
  defaultLanguage: "es",
};

describe("TranslationProvider", () => {
  test("provides translation context to children", () => {
    function TestComponent() {
      const { t } = useTranslation();
      return <div>{t("hello")}</div>;
    }

    const html = renderToString(
      <TranslationProvider config={testConfig} defaultLanguage="es">
        <TestComponent />
      </TranslationProvider>,
    );

    expect(html).toContain("Hola");
  });

  test("uses default language from config", () => {
    function TestComponent() {
      const { t } = useTranslation();
      return <div>{t("hello")}</div>;
    }

    const html = renderToString(
      <TranslationProvider config={testConfig}>
        <TestComponent />
      </TranslationProvider>,
    );

    expect(html).toContain("Hola");
  });

  test("uses explicit default language", () => {
    function TestComponent() {
      const { t } = useTranslation();
      return <div>{t("hello")}</div>;
    }

    const html = renderToString(
      <TranslationProvider config={testConfig} defaultLanguage="en">
        <TestComponent />
      </TranslationProvider>,
    );

    expect(html).toContain("Hello");
  });

  test("provides all translation functions", () => {
    function TestComponent() {
      const { t, tn, td, tc, tr } = useTranslation();
      return (
        <div>
          <p>{t("hello")}</p>
          <p>{tn(1234.56)}</p>
          <p>{td(new Date("2026-01-15"))}</p>
          <p>{tc(100, "USD")}</p>
          <p>{tr(-1, "day")}</p>
        </div>
      );
    }

    const html = renderToString(
      <TranslationProvider config={testConfig} defaultLanguage="es">
        <TestComponent />
      </TranslationProvider>,
    );

    expect(html).toContain("Hola");
    expect(html).toContain("1234,56");
  });

  test("exposes current language", () => {
    function TestComponent() {
      const { language } = useTranslation();
      return <div>Language: {language}</div>;
    }

    const html = renderToString(
      <TranslationProvider config={testConfig} defaultLanguage="en">
        <TestComponent />
      </TranslationProvider>,
    );

    expect(html).toMatch(/Language:.*en/);
  });
});

describe("useTranslation", () => {
  test("throws error when used outside provider", () => {
    function TestComponent() {
      const { t } = useTranslation();
      return <div>{t("hello")}</div>;
    }

    expect(() => {
      renderToString(<TestComponent />);
    }).toThrow("useTranslation must be used within a TranslationProvider");
  });

  test("t function translates keys", () => {
    function TestComponent() {
      const { t } = useTranslation();
      return <div>{t("hello")}</div>;
    }

    const html = renderToString(
      <TranslationProvider config={testConfig} defaultLanguage="es">
        <TestComponent />
      </TranslationProvider>,
    );

    expect(html).toContain("Hola");
  });

  test("t function handles interpolation", () => {
    function TestComponent() {
      const { t } = useTranslation();
      return <div>{t("welcome", { name: "Franz" })}</div>;
    }

    const html = renderToString(
      <TranslationProvider config={testConfig} defaultLanguage="es">
        <TestComponent />
      </TranslationProvider>,
    );

    expect(html).toContain("Bienvenido, Franz");
  });

  test("t function handles pluralization", () => {
    function TestComponent() {
      const { t } = useTranslation();
      return (
        <div>
          <p>{t("items", { count: 0 })}</p>
          <p>{t("items", { count: 1 })}</p>
          <p>{t("items", { count: 5 })}</p>
        </div>
      );
    }

    const html = renderToString(
      <TranslationProvider config={testConfig} defaultLanguage="es">
        <TestComponent />
      </TranslationProvider>,
    );

    expect(html).toContain("Sin artículos");
    expect(html).toContain("1 artículo");
    expect(html).toContain("5 artículos");
  });

  test("tn function formats numbers", () => {
    function TestComponent() {
      const { tn } = useTranslation();
      return <div>{tn(1234.56)}</div>;
    }

    const html = renderToString(
      <TranslationProvider config={testConfig} defaultLanguage="es">
        <TestComponent />
      </TranslationProvider>,
    );

    expect(html).toContain("1234,56");
  });

  test("td function formats dates", () => {
    function TestComponent() {
      const { td } = useTranslation();
      return <div>{td(new Date("2026-01-15"))}</div>;
    }

    const html = renderToString(
      <TranslationProvider config={testConfig} defaultLanguage="es">
        <TestComponent />
      </TranslationProvider>,
    );

    expect(html).toContain("enero");
  });

  test("tc function formats currency", () => {
    function TestComponent() {
      const { tc } = useTranslation();
      return <div>{tc(1234.56, "EUR")}</div>;
    }

    const html = renderToString(
      <TranslationProvider config={testConfig} defaultLanguage="es">
        <TestComponent />
      </TranslationProvider>,
    );

    expect(html).toContain("€");
  });

  test("tr function formats relative time", () => {
    function TestComponent() {
      const { tr } = useTranslation();
      return <div>{tr(-1, "day")}</div>;
    }

    const html = renderToString(
      <TranslationProvider config={testConfig} defaultLanguage="es">
        <TestComponent />
      </TranslationProvider>,
    );

    expect(html.toLowerCase()).toContain("ayer");
  });

  test("hasTranslation checks key existence", () => {
    function TestComponent() {
      const { hasTranslation } = useTranslation();
      return (
        <div>
          {hasTranslation("hello") ? "exists" : "missing"}
          {hasTranslation("nonexistent") ? "exists" : "missing"}
        </div>
      );
    }

    const html = renderToString(
      <TranslationProvider config={testConfig} defaultLanguage="es">
        <TestComponent />
      </TranslationProvider>,
    );

    expect(html).toMatch(/exists.*missing/);
  });

  test("getTranslation returns raw translation", () => {
    function TestComponent() {
      const { getTranslation } = useTranslation();
      return <div>{getTranslation("welcome")}</div>;
    }

    const html = renderToString(
      <TranslationProvider config={testConfig} defaultLanguage="es">
        <TestComponent />
      </TranslationProvider>,
    );

    expect(html).toContain("Bienvenido, {name}");
  });
});

describe("createReactTranslator", () => {
  test("creates translator with default language", () => {
    const { t, language } = createReactTranslator(testConfig);
    expect(language).toBe("es");
    expect(t("hello")).toBe("Hola");
  });

  test("creates translator with specific language", () => {
    const { t, language } = createReactTranslator(testConfig, "en");
    expect(language).toBe("en");
    expect(t("hello")).toBe("Hello");
  });

  test("t function translates correctly", () => {
    const { t } = createReactTranslator(testConfig, "es");
    expect(t("hello")).toBe("Hola");
    expect(t("welcome", { name: "Franz" })).toBe("Bienvenido, Franz");
  });

  test("tn function formats numbers", () => {
    const { tn } = createReactTranslator(testConfig, "es");
    const result = tn(1234.56);
    expect(result).toBe("1234,56");
  });

  test("td function formats dates", () => {
    const { td } = createReactTranslator(testConfig, "es");
    const result = td(new Date("2026-01-15"));
    expect(result).toContain("enero");
  });

  test("tc function formats currency", () => {
    const { tc } = createReactTranslator(testConfig, "en");
    const result = tc(1234.56, "USD");
    expect(result).toContain("$");
  });

  test("tr function formats relative time", () => {
    const { tr } = createReactTranslator(testConfig, "en");
    const result = tr(-1, "day");
    expect(result.toLowerCase()).toContain("yesterday");
  });

  test("setLanguage changes language", () => {
    const translator = createReactTranslator(testConfig, "es");
    expect(translator.t("hello")).toBe("Hola");
    translator.setLanguage("en");
    expect(translator.t("hello")).toBe("Hello");
  });

  test("hasTranslation checks if key exists", () => {
    const { hasTranslation } = createReactTranslator(testConfig, "es");
    expect(hasTranslation("hello")).toBe(true);
    expect(hasTranslation("nonexistent")).toBe(false);
  });

  test("getTranslation returns raw translation", () => {
    const { getTranslation } = createReactTranslator(testConfig, "es");
    expect(getTranslation("welcome")).toBe("Bienvenido, {name}");
  });

  test("handles pluralization", () => {
    const { t } = createReactTranslator(testConfig, "es");
    expect(t("items", { count: 0 })).toBe("Sin artículos");
    expect(t("items", { count: 1 })).toBe("1 artículo");
    expect(t("items", { count: 5 })).toBe("5 artículos");
  });

  test("works in component without context", () => {
    const { t } = createReactTranslator(testConfig, "es");

    function TestComponent() {
      return <div>{t("hello")}</div>;
    }

    const html = renderToString(<TestComponent />);
    expect(html).toContain("Hola");
  });
});
