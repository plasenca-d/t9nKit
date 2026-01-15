/**
 * Centralized i18n Configuration for React
 * 
 * This is the SINGLE SOURCE OF TRUTH for your translations
 * Import this file wherever you need translations
 */

import type { T9nKitConfig } from '../../../src/core';

// ====================================
// 1. Define your language type
// ====================================
export type AppLanguage = 'es' | 'en';

// ====================================
// 2. Your translations
// ====================================
export const translations = {
  es: {
    app: {
      name: "Mi Aplicación",
    },
    nav: {
      home: "Inicio",
      about: "Acerca de",
      products: "Productos",
      contact: "Contacto",
    },
    hero: {
      title: "Bienvenido a React + t9nKit",
      subtitle: "Sistema de traducción reactivo",
      cta: "Comenzar",
    },
    product: {
      name: "Producto",
      price: "Precio: {price}",
      addToCart: "Agregar al carrito",
      inStock: "En stock",
      outOfStock: "Agotado",
    },
    cart: {
      title: "Carrito",
      empty: "Tu carrito está vacío",
      items: {
        zero: "Sin artículos",
        one: "1 artículo",
        other: "{count} artículos",
      },
      total: "Total",
      checkout: "Finalizar compra",
    },
    settings: {
      title: "Configuración",
      language: "Idioma",
      theme: "Tema",
    },
    common: {
      loading: "Cargando...",
      error: "Error",
      success: "Éxito",
      cancel: "Cancelar",
      save: "Guardar",
    },
  },
  en: {
    app: {
      name: "My Application",
    },
    nav: {
      home: "Home",
      about: "About",
      products: "Products",
      contact: "Contact",
    },
    hero: {
      title: "Welcome to React + t9nKit",
      subtitle: "Reactive translation system",
      cta: "Get Started",
    },
    product: {
      name: "Product",
      price: "Price: {price}",
      addToCart: "Add to cart",
      inStock: "In stock",
      outOfStock: "Out of stock",
    },
    cart: {
      title: "Cart",
      empty: "Your cart is empty",
      items: {
        zero: "No items",
        one: "1 item",
        other: "{count} items",
      },
      total: "Total",
      checkout: "Checkout",
    },
    settings: {
      title: "Settings",
      language: "Language",
      theme: "Theme",
    },
    common: {
      loading: "Loading...",
      error: "Error",
      success: "Success",
      cancel: "Cancel",
      save: "Save",
    },
  },
} as const;

// ====================================
// 3. i18n Configuration
// ====================================
export const i18nConfig: T9nKitConfig<AppLanguage> = {
  translations,
  defaultLanguage: 'es',
  languages: {
    es: 'Español',
    en: 'English',
  },
  warnOnMissing: import.meta.env?.DEV !== false, // Only warn in development
};

// ====================================
// 4. Supported languages
// ====================================
export const supportedLanguages: AppLanguage[] = ['es', 'en'];

// ====================================
// 5. Helper: Detect language from browser
// ====================================
export function getBrowserLanguage(): AppLanguage {
  if (typeof window === 'undefined') return 'es';
  
  const browserLang = navigator.language.split('-')[0];
  return supportedLanguages.includes(browserLang as AppLanguage)
    ? (browserLang as AppLanguage)
    : 'es';
}

// ====================================
// 6. Helper: Get language from localStorage
// ====================================
export function getSavedLanguage(): AppLanguage | null {
  if (typeof window === 'undefined') return null;
  
  const saved = localStorage.getItem('app-language');
  return saved && supportedLanguages.includes(saved as AppLanguage)
    ? (saved as AppLanguage)
    : null;
}

// ====================================
// 7. Helper: Save language to localStorage
// ====================================
export function saveLanguage(lang: AppLanguage): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('app-language', lang);
}

// ====================================
// 8. Helper: Get initial language
// ====================================
export function getInitialLanguage(): AppLanguage {
  // Priority: localStorage > browser > default
  return getSavedLanguage() || getBrowserLanguage() || 'es';
}
