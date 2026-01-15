/**
 * Next.js i18n Configuration
 * For App Router (Next.js 13+)
 */

import type { T9nKitConfig } from '../../../src/core';

// Supported languages
export type AppLanguage = 'es' | 'en';

export const supportedLanguages: AppLanguage[] = ['es', 'en'];
export const defaultLanguage: AppLanguage = 'es';

// Translations
export const translations = {
  es: {
    common: {
      home: "Inicio",
      about: "Acerca de",
      contact: "Contacto",
      loading: "Cargando...",
    },
    nav: {
      home: "Inicio",
      products: "Productos",
      blog: "Blog",
      contact: "Contacto",
    },
    home: {
      title: "Bienvenido a Next.js + t9nKit",
      subtitle: "Sistema de traducción para Server y Client Components",
      serverSection: "Sección de Servidor",
      clientSection: "Sección de Cliente",
      cta: "Comenzar",
    },
    product: {
      name: "Producto",
      price: "Precio: {price}",
      description: "Descripción del producto",
      addToCart: "Agregar al carrito",
      viewDetails: "Ver detalles",
    },
    blog: {
      title: "Blog",
      readMore: "Leer más",
      publishedAt: "Publicado el {date}",
      author: "Por {name}",
    },
    metadata: {
      home: {
        title: "Inicio - Mi App",
        description: "Bienvenido a mi aplicación Next.js",
      },
      about: {
        title: "Acerca de - Mi App",
        description: "Conoce más sobre nosotros",
      },
    },
  },
  en: {
    common: {
      home: "Home",
      about: "About",
      contact: "Contact",
      loading: "Loading...",
    },
    nav: {
      home: "Home",
      products: "Products",
      blog: "Blog",
      contact: "Contact",
    },
    home: {
      title: "Welcome to Next.js + t9nKit",
      subtitle: "Translation system for Server and Client Components",
      serverSection: "Server Section",
      clientSection: "Client Section",
      cta: "Get Started",
    },
    product: {
      name: "Product",
      price: "Price: {price}",
      description: "Product description",
      addToCart: "Add to cart",
      viewDetails: "View details",
    },
    blog: {
      title: "Blog",
      readMore: "Read more",
      publishedAt: "Published on {date}",
      author: "By {name}",
    },
    metadata: {
      home: {
        title: "Home - My App",
        description: "Welcome to my Next.js application",
      },
      about: {
        title: "About - My App",
        description: "Learn more about us",
      },
    },
  },
} as const;

// Language names for UI
export const languageNames: Record<AppLanguage, string> = {
  es: 'Español',
  en: 'English',
};

// t9nKit configuration
export const i18nConfig: T9nKitConfig<AppLanguage> = {
  translations,
  defaultLanguage,
  languages: languageNames,
  warnOnMissing: process.env.NODE_ENV === 'development',
};

/**
 * Type-safe language validation
 */
export function isValidLanguage(lang: string): lang is AppLanguage {
  return supportedLanguages.includes(lang as AppLanguage);
}

/**
 * Get language from params or default
 */
export function getLanguageFromParams(params: { lang?: string }): AppLanguage {
  if (params.lang && isValidLanguage(params.lang)) {
    return params.lang;
  }
  return defaultLanguage;
}
