import type {
  T9nKitConfig,
  LanguageCode,
  PluralCount,
  TranslationParams,
  TranslationPlural,
  TranslationValue,
  TranslationLoader,
} from "./types";
import {
  formatCurrency,
  formatDate,
  formatNumber,
  formatRelativeTime,
  getNestedValue,
  getPluralForm,
  interpolate,
} from "./helpers";

/**
 * Parse a key into namespace + path
 * "auth:login.title" -> { namespace: "auth", path: "login.title" }
 * "login.title"      -> { namespace: null, path: "login.title" }
 */
function parseKey(key: string): { namespace: string | null; path: string } {
  const colonIndex = key.indexOf(":");
  if (colonIndex === -1) {
    return { namespace: null, path: key };
  }
  return {
    namespace: key.slice(0, colonIndex),
    path: key.slice(colonIndex + 1),
  };
}

/**
 * T9nKit - Translation Kit
 * Main translator class
 */
export class T9nKit<T extends LanguageCode = string> {
  private config: T9nKitConfig<T>;
  private currentLanguage: T;
  private namespaceStore: Map<
    string,
    Record<T, Record<string, TranslationValue>>
  > = new Map();
  private loaders: Map<string, TranslationLoader<T>> = new Map();
  private loadingPromises: Map<string, Promise<void>> = new Map();
  private loadedSet: Set<string> = new Set();

  constructor(config: T9nKitConfig<T>) {
    this.config = {
      warnOnMissing: true,
      ...config,
    };
    this.currentLanguage = config.defaultLanguage;

    if (config.namespaces) {
      for (const [name, translations] of Object.entries(config.namespaces)) {
        this.namespaceStore.set(
          name,
          translations as Record<T, Record<string, TranslationValue>>,
        );
      }
    }

    if (config.lazyNamespaces) {
      for (const [name, loader] of Object.entries(config.lazyNamespaces)) {
        this.loaders.set(name, loader as TranslationLoader<T>);
      }
    }
  }

  /**
   * Get current language
   */
  getLanguage(): T {
    return this.currentLanguage;
  }

  /**
   * Set current language
   */
  setLanguage(lang: T): void {
    if (!this.config.translations[lang]) {
      this.warn(`Language "${lang}" not found in translations`);
      return;
    }
    this.currentLanguage = lang;
  }

  /**
   * Get all available languages
   */
  getLanguages(): Record<T, string> | undefined {
    return this.config.languages;
  }

  // ─── Namespace methods ──────────────────────────────────────────────────

  /**
   * Add a namespace at runtime
   */
  addNamespace(
    name: string,
    translations: Record<T, Record<string, TranslationValue>>,
  ): void {
    const existing = this.namespaceStore.get(name);
    if (existing) {
      // Merge: for each language, merge keys
      for (const lang of Object.keys(translations) as T[]) {
        if (existing[lang]) {
          existing[lang] = { ...existing[lang], ...translations[lang] };
        } else {
          existing[lang] = translations[lang];
        }
      }
    } else {
      this.namespaceStore.set(name, { ...translations });
    }
  }

  /**
   * Check if a namespace exists
   */
  hasNamespace(name: string): boolean {
    return this.namespaceStore.has(name) || this.loaders.has(name);
  }

  /**
   * Get all loaded namespace names
   */
  getNamespaces(): string[] {
    return Array.from(this.namespaceStore.keys());
  }

  /**
   * Remove a namespace
   */
  removeNamespace(name: string): void {
    this.namespaceStore.delete(name);

    for (const key of this.loadedSet) {
      if (key.startsWith(name + ":")) {
        this.loadedSet.delete(key);
      }
    }
  }

  // ─── Lazy loading methods ───────────────────────────────────────────────

  /**
   * Register a lazy loader for a namespace
   */
  registerLoader(namespace: string, loader: TranslationLoader<T>): void {
    this.loaders.set(namespace, loader);
  }

  /**
   * Load a namespace asynchronously for a language (or current language)
   * Deduplicates concurrent calls for the same namespace+lang combo
   */
  async loadNamespace(namespace: string, lang?: T): Promise<void> {
    const targetLang = lang || this.currentLanguage;
    const cacheKey = `${namespace}:${targetLang}`;

    if (this.loadedSet.has(cacheKey)) return;

    const existing = this.loadingPromises.get(cacheKey);
    if (existing) return existing;

    const loader = this.loaders.get(namespace);
    if (!loader) {
      this.warn(`No loader registered for namespace "${namespace}"`);
      return;
    }

    const promise = (async () => {
      try {
        const translations = await loader(targetLang);
        const nsTranslations = {} as Record<
          T,
          Record<string, TranslationValue>
        >;
        nsTranslations[targetLang] = translations;
        this.addNamespace(namespace, nsTranslations);
        this.loadedSet.add(cacheKey);
      } finally {
        this.loadingPromises.delete(cacheKey);
      }
    })();

    this.loadingPromises.set(cacheKey, promise);
    return promise;
  }

  /**
   * Load multiple namespaces at once
   */
  async loadNamespaces(namespaces: string[], lang?: T): Promise<void> {
    await Promise.all(namespaces.map((ns) => this.loadNamespace(ns, lang)));
  }

  /**
   * Check if a namespace has been loaded for a language
   */
  isNamespaceLoaded(namespace: string, lang?: T): boolean {
    const targetLang = lang || this.currentLanguage;
    return this.loadedSet.has(`${namespace}:${targetLang}`);
  }

  // ─── Translation resolution ─────────────────────────────────────────────

  /**
   * Resolve a translation value from namespaces or top-level translations
   */
  private resolveTranslation(
    key: string,
    targetLang: T,
  ): { value: any; originalKey: string } {
    const { namespace, path } = parseKey(key);

    // Explicit namespace: "auth:login.title"
    if (namespace) {
      const nsData = this.namespaceStore.get(namespace);
      if (nsData) {
        const value =
          getNestedValue(nsData[targetLang], path) ??
          getNestedValue(nsData[this.config.defaultLanguage], path);
        if (value !== undefined) return { value, originalKey: key };
      }

      return { value: undefined, originalKey: key };
    }

    // Default namespace (keys without ":")
    if (this.config.defaultNamespace) {
      const nsData = this.namespaceStore.get(this.config.defaultNamespace);
      if (nsData) {
        const value =
          getNestedValue(nsData[targetLang], path) ??
          getNestedValue(nsData[this.config.defaultLanguage], path);
        if (value !== undefined) return { value, originalKey: key };
      }
    }

    // Top-level translations
    const value =
      getNestedValue(this.config.translations[targetLang], path) ??
      getNestedValue(
        this.config.translations[this.config.defaultLanguage],
        path,
      );
    return { value, originalKey: key };
  }

  /**
   * Main translation function
   * Supports dot notation (nav.home), namespaces (auth:login), and nested objects
   */
  translate(
    key: string,
    params?: TranslationParams & { count?: PluralCount },
    lang?: T,
  ): string {
    const targetLang = lang || this.currentLanguage;
    const { value: translation } = this.resolveTranslation(key, targetLang);

    if (translation === undefined || translation === null) {
      this.warn(`Translation missing for key: ${key}`);
      return key;
    }

    // Case 1: Pluralization object
    if (
      typeof translation === "object" &&
      "one" in translation &&
      params?.count !== undefined
    ) {
      return this.handlePlural(translation, params.count, params, targetLang);
    }

    // Case 2: Translation function
    if (typeof translation === "function") {
      return translation(params || {});
    }

    // Case 3: Simple string with possible interpolation
    if (typeof translation === "string") {
      return params ? interpolate(translation, params) : translation;
    }

    // Case 4: Nested object (return key as fallback)
    if (typeof translation === "object") {
      this.warn(`Translation for key "${key}" is an object, not a string`);
      return key;
    }

    return key;
  }

  /**
   * Handle pluralization translations
   */
  private handlePlural(
    pluralObj: TranslationPlural,
    count: PluralCount,
    params: TranslationParams,
    lang: T,
  ): string {
    const form = getPluralForm(count, lang);
    let text = pluralObj[form] || pluralObj.other;

    // Add count in parameters whether used or not
    const finalParams = { ...params, count };
    return interpolate(text, finalParams);
  }

  /**
   * Format number according to current language
   */
  formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
    return formatNumber(value, this.currentLanguage, options);
  }

  /**
   * Format date according to current language
   */
  formatDate(
    date: Date | string | number,
    options?: Intl.DateTimeFormatOptions,
  ): string {
    return formatDate(date, this.currentLanguage, options);
  }

  /**
   * Format currency according to current language
   */
  formatCurrency(value: number, currency?: string): string {
    return formatCurrency(value, this.currentLanguage, currency);
  }

  /**
   * Format relative time according to current language
   */
  formatRelativeTime(value: number, unit: Intl.RelativeTimeFormatUnit): string {
    return formatRelativeTime(value, unit, this.currentLanguage);
  }

  /**
   * Check if a translation key exists
   */
  hasTranslation(key: string, lang?: T): boolean {
    const targetLang = lang || this.currentLanguage;
    const { value } = this.resolveTranslation(key, targetLang);
    return value !== undefined;
  }

  /**
   * Get translation without interpolation
   */
  getTranslation(key: string, lang?: T): string {
    const targetLang = lang || this.currentLanguage;
    const { value: translation } = this.resolveTranslation(key, targetLang);

    if (typeof translation === "string") {
      return translation;
    }

    this.warn(`Translation for key "${key}" is not a simple string`);
    return key;
  }

  /**
   * Internal warning logger
   */
  private warn(message: string): void {
    if (this.config.warnOnMissing) {
      console.warn(`[t9nKit] ${message}`);
    }
  }
}

/**
 * Creates a translation hook similar to the original useTranslations
 * Returns translation functions bound to a specific language
 */
export function createTranslator<T extends LanguageCode = string>(
  config: T9nKitConfig<T>,
  lang?: T,
): {
  t: (
    key: string,
    params?: TranslationParams & { count?: PluralCount },
  ) => string;
  tn: (value: number, options?: Intl.NumberFormatOptions) => string;
  td: (
    date: Date | string | number,
    options?: Intl.DateTimeFormatOptions,
  ) => string;
  tc: (value: number, currency?: string) => string;
  tr: (value: number, unit: Intl.RelativeTimeFormatUnit) => string;
  getLanguage: () => T;
  setLanguage: (newLang: T) => void;
  hasTranslation: (key: string) => boolean;
  getTranslation: (key: string) => string;
  addNamespace: (
    name: string,
    translations: Record<T, Record<string, TranslationValue>>,
  ) => void;
  hasNamespace: (name: string) => boolean;
  getNamespaces: () => string[];
  removeNamespace: (name: string) => void;
  loadNamespace: (namespace: string, lang?: T) => Promise<void>;
  loadNamespaces: (namespaces: string[], lang?: T) => Promise<void>;
  isNamespaceLoaded: (namespace: string, lang?: T) => boolean;
  registerLoader: (namespace: string, loader: TranslationLoader<T>) => void;
} {
  const kit = new T9nKit(config);
  if (lang) kit.setLanguage(lang);

  return {
    t: (
      key: string,
      params?: TranslationParams & { count?: PluralCount },
    ): string => kit.translate(key, params),

    tn: (value: number, options?: Intl.NumberFormatOptions): string =>
      kit.formatNumber(value, options),

    td: (
      date: Date | string | number,
      options?: Intl.DateTimeFormatOptions,
    ): string => kit.formatDate(date, options),

    tc: (value: number, currency?: string): string =>
      kit.formatCurrency(value, currency),

    tr: (value: number, unit: Intl.RelativeTimeFormatUnit): string =>
      kit.formatRelativeTime(value, unit),

    getLanguage: (): T => kit.getLanguage(),

    setLanguage: (newLang: T): void => kit.setLanguage(newLang),

    hasTranslation: (key: string): boolean => kit.hasTranslation(key),

    getTranslation: (key: string): string => kit.getTranslation(key),

    addNamespace: (
      name: string,
      translations: Record<T, Record<string, TranslationValue>>,
    ): void => kit.addNamespace(name, translations),

    hasNamespace: (name: string): boolean => kit.hasNamespace(name),

    getNamespaces: (): string[] => kit.getNamespaces(),

    removeNamespace: (name: string): void => kit.removeNamespace(name),

    loadNamespace: (namespace: string, lng?: T): Promise<void> =>
      kit.loadNamespace(namespace, lng),

    loadNamespaces: (namespaces: string[], lng?: T): Promise<void> =>
      kit.loadNamespaces(namespaces, lng),

    isNamespaceLoaded: (namespace: string, lng?: T): boolean =>
      kit.isNamespaceLoaded(namespace, lng),

    registerLoader: (namespace: string, loader: TranslationLoader<T>): void =>
      kit.registerLoader(namespace, loader),
  };
}
