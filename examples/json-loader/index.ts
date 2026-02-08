/**
 * JSON Loader example
 * Run with: bun run examples/json-loader/index.ts
 */

import { createTranslator } from "../../src";
import { loadJsonTranslations } from "../../src/loaders";

// ─── Example 1: Simple translations ─────────────────────────────────────────

console.log("=== Example 1: Simple translations ===\n");

const simpleConfig = loadJsonTranslations(
  {
    en: {
      greeting: "Hello!",
      farewell: "Goodbye!",
    },
    es: {
      greeting: "¡Hola!",
      farewell: "¡Adiós!",
    },
  },
  { defaultLanguage: "en" },
);

const { t } = createTranslator(simpleConfig, "es");

console.log(t("greeting")); // "¡Hola!"
console.log(t("farewell")); // "¡Adiós!"

// ─── Example 2: Interpolation ───────────────────────────────────────────────

console.log("\n=== Example 2: Interpolation ===\n");

const interpConfig = loadJsonTranslations(
  {
    en: {
      welcome: "Welcome, {name}!",
      message: "{user} sent you {count} messages",
    },
    es: {
      welcome: "¡Bienvenido, {name}!",
      message: "{user} te envió {count} mensajes",
    },
  },
  { defaultLanguage: "en" },
);

const { t: t2 } = createTranslator(interpConfig, "en");

console.log(t2("welcome", { name: "Alice" }));
// "Welcome, Alice!"

console.log(t2("message", { user: "Bob", count: 3 }));
// "Bob sent you 3 messages"

// ─── Example 3: Pluralization ───────────────────────────────────────────────

console.log("\n=== Example 3: Pluralization ===\n");

const pluralConfig = loadJsonTranslations(
  {
    en: {
      items: {
        zero: "No items",
        one: "1 item",
        other: "{count} items",
      },
      notifications: {
        zero: "No new notifications",
        one: "You have 1 new notification",
        other: "You have {count} new notifications",
      },
    },
    es: {
      items: {
        zero: "Sin artículos",
        one: "1 artículo",
        other: "{count} artículos",
      },
      notifications: {
        zero: "Sin notificaciones nuevas",
        one: "Tienes 1 notificación nueva",
        other: "Tienes {count} notificaciones nuevas",
      },
    },
  },
  { defaultLanguage: "en" },
);

const { t: t3 } = createTranslator(pluralConfig, "en");

console.log(t3("items", { count: 0 })); // "No items"
console.log(t3("items", { count: 1 })); // "1 item"
console.log(t3("items", { count: 42 })); // "42 items"

console.log(t3("notifications", { count: 0 })); // "No new notifications"
console.log(t3("notifications", { count: 1 })); // "You have 1 new notification"
console.log(t3("notifications", { count: 5 })); // "You have 5 new notifications"

// ─── Example 4: Nested translations ─────────────────────────────────────────

console.log("\n=== Example 4: Nested translations ===\n");

const nestedConfig = loadJsonTranslations(
  {
    en: {
      nav: {
        home: "Home",
        about: "About",
        settings: {
          profile: "Profile",
          account: "Account",
          notifications: "Notifications",
        },
      },
      errors: {
        notFound: "Page not found",
        unauthorized: "You don't have permission to access this page",
      },
    },
    es: {
      nav: {
        home: "Inicio",
        about: "Acerca de",
        settings: {
          profile: "Perfil",
          account: "Cuenta",
          notifications: "Notificaciones",
        },
      },
      errors: {
        notFound: "Página no encontrada",
        unauthorized: "No tienes permiso para acceder a esta página",
      },
    },
  },
  { defaultLanguage: "en" },
);

const { t: t4 } = createTranslator(nestedConfig, "es");

console.log(t4("nav.home")); // "Inicio"
console.log(t4("nav.settings.profile")); // "Perfil"
console.log(t4("errors.notFound")); // "Página no encontrada"

// ─── Example 5: Simulating JSON file imports ────────────────────────────────

console.log("\n=== Example 5: Simulating JSON file imports ===\n");

// In a real project you'd import JSON files:
//   import en from './locales/en.json'
//   import es from './locales/es.json'
//   import fr from './locales/fr.json'

const en = {
  app: {
    title: "My App",
    description: "A multilingual application",
  },
  auth: {
    login: "Log in",
    logout: "Log out",
    welcome: "Welcome back, {username}!",
  },
  cart: {
    items: { zero: "Cart is empty", one: "1 item in cart", other: "{count} items in cart" },
    total: "Total: {amount}",
  },
};

const es = {
  app: {
    title: "Mi App",
    description: "Una aplicación multilingüe",
  },
  auth: {
    login: "Iniciar sesión",
    logout: "Cerrar sesión",
    welcome: "¡Bienvenido de nuevo, {username}!",
  },
  cart: {
    items: { zero: "Carrito vacío", one: "1 artículo en el carrito", other: "{count} artículos en el carrito" },
    total: "Total: {amount}",
  },
};

const fr = {
  app: {
    title: "Mon App",
    description: "Une application multilingue",
  },
  auth: {
    login: "Se connecter",
    logout: "Se déconnecter",
    welcome: "Bon retour, {username} !",
  },
  cart: {
    items: { zero: "Panier vide", one: "1 article dans le panier", other: "{count} articles dans le panier" },
    total: "Total : {amount}",
  },
};

const config = loadJsonTranslations(
  { en, es, fr },
  {
    defaultLanguage: "en",
    languages: { en: "English", es: "Español", fr: "Français" },
  },
);

const {
  t: translate,
  getLanguage,
  setLanguage,
} = createTranslator(config, "en");

console.log(`[${getLanguage()}] ${translate("app.title")}`);
// "[en] My App"

console.log(`[${getLanguage()}] ${translate("auth.welcome", { username: "Alice" })}`);
// "[en] Welcome back, Alice!"

console.log(`[${getLanguage()}] ${translate("cart.items", { count: 3 })}`);
// "[en] 3 items in cart"

setLanguage("es");
console.log(`\n[${getLanguage()}] ${translate("app.title")}`);
// "[es] Mi App"

console.log(`[${getLanguage()}] ${translate("auth.welcome", { username: "Alice" })}`);
// "[es] ¡Bienvenido de nuevo, Alice!"

setLanguage("fr");
console.log(`\n[${getLanguage()}] ${translate("app.title")}`);
// "[fr] Mon App"

console.log(`[${getLanguage()}] ${translate("cart.items", { count: 0 })}`);
// "[fr] Panier vide"
