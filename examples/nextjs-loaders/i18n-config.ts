/**
 * Next.js i18n Configuration using the JSON Loader
 */

import { loadJsonTranslations } from "../../src/loaders";

// ─── Supported languages ────────────────────────────────────────────────────

export type AppLanguage = "en" | "es";

export const supportedLanguages: AppLanguage[] = ["en", "es"];
export const defaultLanguage: AppLanguage = "es";

export const languageNames: Record<AppLanguage, string> = {
  en: "English",
  es: "Español",
};

// ─── Translations ───────────────────────────────────────────────────────────
// In a real project you'd import actual .json files:
//   import en from './locales/en.json'
//   import es from './locales/es.json'

const en = {
  nav: {
    home: "Home",
    products: "Products",
    blog: "Blog",
    contact: "Contact",
  },
  home: {
    title: "Welcome to Next.js + t9nKit",
    subtitle: "Using the JSON loader for translations",
    serverSection: "Server Section",
    clientSection: "Client Section",
    cta: "Get Started",
  },
  product: {
    name: "Product",
    price: "Price: {price}",
    description: "Product description",
    addToCart: "Add to cart",
    cartItems: {
      zero: "Cart is empty",
      one: "1 item in cart",
      other: "{count} items in cart",
    },
  },
  blog: {
    title: "Blog",
    readMore: "Read more",
    publishedAt: "Published on {date}",
    author: "By {name}",
    comments: {
      zero: "No comments",
      one: "1 comment",
      other: "{count} comments",
    },
  },
  metadata: {
    home: {
      title: "Home - My App",
      description: "Welcome to my Next.js application",
    },
  },
};

const es = {
  nav: {
    home: "Inicio",
    products: "Productos",
    blog: "Blog",
    contact: "Contacto",
  },
  home: {
    title: "Bienvenido a Next.js + t9nKit",
    subtitle: "Usando el loader de JSON para traducciones",
    serverSection: "Sección de Servidor",
    clientSection: "Sección de Cliente",
    cta: "Comenzar",
  },
  product: {
    name: "Producto",
    price: "Precio: {price}",
    description: "Descripción del producto",
    addToCart: "Agregar al carrito",
    cartItems: {
      zero: "Carrito vacío",
      one: "1 artículo en el carrito",
      other: "{count} artículos en el carrito",
    },
  },
  blog: {
    title: "Blog",
    readMore: "Leer más",
    publishedAt: "Publicado el {date}",
    author: "Por {name}",
    comments: {
      zero: "Sin comentarios",
      one: "1 comentario",
      other: "{count} comentarios",
    },
  },
  metadata: {
    home: {
      title: "Inicio - Mi App",
      description: "Bienvenido a mi aplicación Next.js",
    },
  },
};

export const i18nConfig = loadJsonTranslations(
  { en, es },
  {
    defaultLanguage,
    languages: languageNames,
    warnOnMissing: process.env.NODE_ENV === "development",
  },
);

// ─── Helpers ────────────────────────────────────────────────────────────────

export function isValidLanguage(lang: string): lang is AppLanguage {
  return supportedLanguages.includes(lang as AppLanguage);
}

export function getLanguageFromParams(params: { lang?: string }): AppLanguage {
  if (params.lang && isValidLanguage(params.lang)) {
    return params.lang;
  }
  return defaultLanguage;
}
