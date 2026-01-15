/**
 * React Hooks for t9nKit
 *
 * Provides React-friendly hooks for translation with:
 * - Context API for sharing translator across components
 * - useTranslation hook (similar to react-i18next)
 * - Language switching with reactivity
 *
 * @module t9nkit/react
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { T9nKit, type T9nKitConfig, type LanguageCode } from "./core";

/**
 * Translation context type
 */
interface TranslationContextType<T extends LanguageCode = string> {
  language: T;
  setLanguage: (lang: T) => void;
  t: (key: string, params?: any) => string;
  tn: (value: number, options?: Intl.NumberFormatOptions) => string;
  td: (
    date: Date | string | number,
    options?: Intl.DateTimeFormatOptions,
  ) => string;
  tc: (value: number, currency?: string) => string;
  tr: (value: number, unit: Intl.RelativeTimeFormatUnit) => string;
  hasTranslation: (key: string) => boolean;
  getTranslation: (key: string) => string;
}

/**
 * Translation context
 */
const TranslationContext = createContext<TranslationContextType | null>(null);

/**
 * Props for TranslationProvider
 */
interface TranslationProviderProps<T extends LanguageCode = string> {
  children: ReactNode;
  config: T9nKitConfig<T>;
  defaultLanguage?: T;
}

/**
 * Translation Provider Component
 *
 * Wrap your app with this to provide translations to all components
 *
 * @example
 * ```tsx
 * import { TranslationProvider } from 't9nkit/react';
 * import { i18nConfig } from './i18n/config';
 *
 * function App() {
 *   return (
 *     <TranslationProvider config={i18nConfig} defaultLanguage="es">
 *       <YourApp />
 *     </TranslationProvider>
 *   );
 * }
 * ```
 */
export function TranslationProvider<T extends LanguageCode = string>({
  children,
  config,
  defaultLanguage,
}: TranslationProviderProps<T>): React.ReactElement {
  const initialLanguage = defaultLanguage || config.defaultLanguage;

  const kit = useMemo(() => {
    const instance = new T9nKit(config);
    instance.setLanguage(initialLanguage);
    return instance;
  }, [config, initialLanguage]);

  const [language, setLanguageState] = useState<T>(initialLanguage);

  const setLanguage = useCallback(
    (lang: T): void => {
      kit.setLanguage(lang);
      setLanguageState(lang);
    },
    [kit],
  );

  const t = useCallback(
    (key: string, params?: any): string => {
      return kit.translate(key, params);
    },
    [kit, language],
  );

  const tn = useCallback(
    (value: number, options?: Intl.NumberFormatOptions): string => {
      return kit.formatNumber(value, options);
    },
    [kit, language],
  );

  const td = useCallback(
    (
      date: Date | string | number,
      options?: Intl.DateTimeFormatOptions,
    ): string => {
      return kit.formatDate(date, options);
    },
    [kit, language],
  );

  const tc = useCallback(
    (value: number, currency?: string): string => {
      return kit.formatCurrency(value, currency);
    },
    [kit, language],
  );

  const tr = useCallback(
    (value: number, unit: Intl.RelativeTimeFormatUnit): string => {
      return kit.formatRelativeTime(value, unit);
    },
    [kit, language],
  );

  const hasTranslation = useCallback(
    (key: string): boolean => {
      return kit.hasTranslation(key);
    },
    [kit, language],
  );

  const getTranslation = useCallback(
    (key: string): string => {
      return kit.getTranslation(key);
    },
    [kit, language],
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      tn,
      td,
      tc,
      tr,
      hasTranslation,
      getTranslation,
    }),
    [language, setLanguage, t, tn, td, tc, tr, hasTranslation, getTranslation],
  );

  return (
    <TranslationContext.Provider
      value={value as unknown as TranslationContextType}
    >
      {children}
    </TranslationContext.Provider>
  );
}

/**
 * Hook to use translations in components
 *
 * Must be used within a TranslationProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { t, language, setLanguage } = useTranslation();
 *
 *   return (
 *     <div>
 *       <h1>{t('welcome.title')}</h1>
 *       <button onClick={() => setLanguage('en')}>English</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTranslation<T extends LanguageCode = string>() {
  const context = useContext(TranslationContext);

  if (!context) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }

  return context as unknown as TranslationContextType<T>;
}

/**
 * Create a standalone translator (without context)
 * Useful for components that don't need reactivity
 *
 * @example
 * ```tsx
 * import { createReactTranslator } from 't9nkit/react';
 * import { i18nConfig } from './i18n/config';
 *
 * function StaticComponent() {
 *   const { t } = createReactTranslator(i18nConfig, 'es');
 *
 *   return <h1>{t('title')}</h1>;
 * }
 * ```
 */
export function createReactTranslator<T extends LanguageCode = string>(
  config: T9nKitConfig<T>,
  lang?: T,
): {
  t: (key: string, params?: any) => string;
  tn: (value: number, options?: Intl.NumberFormatOptions) => string;
  td: (
    date: Date | string | number,
    options?: Intl.DateTimeFormatOptions,
  ) => string;
  tc: (value: number, currency?: string) => string;
  tr: (value: number, unit: Intl.RelativeTimeFormatUnit) => string;
  language: T;
  setLanguage: (newLang: T) => void;
  hasTranslation: (key: string) => boolean;
  getTranslation: (key: string) => string;
} {
  const kit = new T9nKit(config);
  if (lang) kit.setLanguage(lang);

  return {
    t: (key: string, params?: any): string => kit.translate(key, params),
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
    language: kit.getLanguage() as T,
    setLanguage: (newLang: T): void => kit.setLanguage(newLang),
    hasTranslation: (key: string): boolean => kit.hasTranslation(key),
    getTranslation: (key: string): string => kit.getTranslation(key),
  };
}
