# 🌍 t9nKit

> Complete i18n translation system with **zero dependencies** - Works on server and client

[![npm version](https://img.shields.io/npm/v/t9nkit.svg)](https://www.npmjs.com/package/t9nkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)

## Features

- **Zero dependencies** - Lightweight and fast
- **TypeScript first** - Full type safety with excellent autocomplete
- **Universal** - Works on server (Node.js, Bun, Deno) and client (Browser)
- **Framework agnostic** - Works with Astro, React, Next.js, or vanilla JS
- **Simple interpolation** - `{variable}` syntax
- **Automatic pluralization** - Smart plural rules
- **Nested translations** - Organize with dot notation
- **Number/Date/Currency formatting** - Built-in Intl support
- **Relative time** - "2 days ago" style formatting
- **Tree-shakeable** - Only bundle what you use

## Installation

```bash
npm install t9nkit
# or
bun add t9nkit
```

## Quick Start

```typescript
import { createTranslator } from 't9nkit';

const { t, tn, td } = createTranslator({
  translations: {
    en: {
      "hello": "Hello",
      "welcome": "Welcome, {name}!",
      "items": {
        "zero": "No items",
        "one": "1 item",
        "other": "{count} items"
      }
    },
    es: {
      "hello": "Hola",
      "welcome": "¡Bienvenido, {name}!",
      "items": {
        "zero": "Sin artículos",
        "one": "1 artículo",
        "other": "{count} artículos"
      }
    }
  },
  defaultLanguage: 'es'
}, 'es');

t('hello');                       // "Hola"
t('welcome', { name: 'Franz' });  // "¡Bienvenido, Franz!"
t('items', { count: 5 });         // "5 artículos"
tn(1234.56);                      // "1.234,56"
td(new Date());                   // "15 de enero de 2026"
```

## Framework Integration

### Astro

```astro
---
import { useTranslations, getLangFromUrl } from 't9nkit/astro';
import { t9nConfig } from './i18n/config';

const lang = getLangFromUrl(Astro.url, ['es', 'en'], 'es');
const { t, tn } = useTranslations(t9nConfig, lang);
---

<h1>{t('nav.home')}</h1>
<p>{tn(1234.56)}</p>
```

### React

```tsx
import { TranslationProvider, useTranslation } from 't9nkit/react';

function App() {
  return (
    <TranslationProvider config={i18nConfig} defaultLanguage="es">
      <MyComponent />
    </TranslationProvider>
  );
}

function MyComponent() {
  const { t, setLanguage } = useTranslation();
  return <h1>{t('hero.title')}</h1>;
}
```

### Next.js

```tsx
// Server Component
import { createServerTranslator } from 't9nkit/nextjs';

export default async function Page({ params }) {
  const { t } = createServerTranslator(i18nConfig, params.lang);
  return <h1>{t('welcome')}</h1>;
}

// Client Component
'use client';
import { useNextTranslation } from 't9nkit/nextjs';

export default function Counter() {
  const { t } = useNextTranslation();
  return <button>{t('increment')}</button>;
}
```

## JSON Loader

Load translations from JSON objects or `.json` files instead of building the config manually.

```typescript
import { loadJsonTranslations } from 't9nkit/loaders';
import { createTranslator } from 't9nkit';

// Import your JSON files
// import en from './locales/en.json';
// import es from './locales/es.json';

const en = {
  greeting: "Hello, {name}!",
  items: { zero: "No items", one: "1 item", other: "{count} items" },
  nav: {
    home: "Home",
    settings: { profile: "Profile", account: "Account" }
  }
};

const es = {
  greeting: "¡Hola, {name}!",
  items: { zero: "Sin artículos", one: "1 artículo", other: "{count} artículos" },
  nav: {
    home: "Inicio",
    settings: { profile: "Perfil", account: "Cuenta" }
  }
};

const config = loadJsonTranslations(
  { en, es },
  { defaultLanguage: 'es', languages: { en: 'English', es: 'Español' } }
);

const { t } = createTranslator(config, 'es');

t('greeting', { name: 'Franz' });  // "¡Hola, Franz!"
t('items', { count: 5 });          // "5 artículos"
t('nav.settings.profile');         // "Perfil"
```

The loader automatically detects:
- **Strings** — plain translations
- **Plural objects** — objects with `one` + `other` keys (`{ zero?, one, other }`)
- **Nested objects** — everything else becomes dot-notation accessible

The returned config works directly with `createTranslator`, `T9nKit`, and all framework integrations.

## Namespaces

Organize large translation files by splitting them into namespaces. Use the `:` separator to access namespaced keys.

```typescript
import { createTranslator } from 't9nkit';

const { t, addNamespace, getNamespaces } = createTranslator({
  translations: {
    en: { welcome: "Welcome" },
    es: { welcome: "Bienvenido" }
  },
  defaultLanguage: 'es',
  namespaces: {
    auth: {
      en: { "login.title": "Sign In", "login.button": "Log In" },
      es: { "login.title": "Iniciar Sesión", "login.button": "Entrar" }
    },
    dashboard: {
      en: { "stats.title": "Statistics" },
      es: { "stats.title": "Estadísticas" }
    }
  }
}, 'es');

// Access namespaced keys with ":"
t('auth:login.title');    // "Iniciar Sesión"
t('dashboard:stats.title'); // "Estadísticas"

// Keys without ":" use top-level translations
t('welcome');             // "Bienvenido"

// Add namespaces at runtime
addNamespace('settings', {
  en: { "theme": "Theme", "language": "Language" },
  es: { "theme": "Tema", "language": "Idioma" }
});

t('settings:theme');      // "Tema"
getNamespaces();          // ["auth", "dashboard", "settings"]
```

### Default Namespace

Set a `defaultNamespace` so keys without `:` look there first:

```typescript
const { t } = createTranslator({
  translations: {
    es: { fallback: "Texto global" }
  },
  defaultLanguage: 'es',
  namespaces: {
    common: {
      es: { greeting: "¡Hola!", fallback: "Texto del namespace" }
    }
  },
  defaultNamespace: 'common'
}, 'es');

t('greeting');   // "¡Hola!" (from "common" namespace)
t('fallback');   // "Texto del namespace" (default namespace wins)
```

### Namespaced JSON Loader

Load namespaces directly from JSON files:

```typescript
import { loadNamespacedJsonTranslations } from 't9nkit/loaders';
import { createTranslator } from 't9nkit';

const config = loadNamespacedJsonTranslations(
  {
    auth: {
      en: { login: { title: "Sign In" } },
      es: { login: { title: "Iniciar Sesión" } }
    },
    dashboard: {
      en: { stats: { title: "Statistics" } },
      es: { stats: { title: "Estadísticas" } }
    }
  },
  { defaultLanguage: 'es', defaultNamespace: 'auth' }
);

const { t } = createTranslator(config, 'es');
t('login.title');              // "Iniciar Sesión" (default namespace)
t('dashboard:stats.title');    // "Estadísticas"
```

## Lazy Loading

Load translation namespaces on demand instead of bundling everything upfront. Perfect for large apps where you want to split translations by route or feature.

```typescript
import { createTranslator } from 't9nkit';

const { t, loadNamespace, isNamespaceLoaded } = createTranslator({
  translations: {
    en: { app: "My App" },
    es: { app: "Mi App" }
  },
  defaultLanguage: 'es',
  lazyNamespaces: {
    settings: async (lang) => {
      const mod = await import(`./locales/${lang}/settings.json`);
      return mod.default;
    },
    profile: async (lang) => {
      const res = await fetch(`/api/translations/${lang}/profile`);
      return res.json();
    }
  }
}, 'es');

// Load before using
await loadNamespace('settings');

isNamespaceLoaded('settings');  // true
t('settings:theme');            // "Tema"

// Load multiple at once
await loadNamespaces(['settings', 'profile']);
```

### Register Loaders at Runtime

```typescript
const { registerLoader, loadNamespace, t } = createTranslator(config, 'es');

registerLoader('checkout', async (lang) => {
  const res = await fetch(`/api/translations/${lang}/checkout`);
  return res.json();
});

await loadNamespace('checkout');
t('checkout:pay.button');   // "Pagar ahora"
```

> **Note:** `t()` is always synchronous. If you call `t('namespace:key')` before loading the namespace, it returns the key as-is and logs a warning.

## Browser Language Detection

Detect the user's preferred language from multiple browser sources. SSR-safe — all sources check for browser globals before accessing them.

```typescript
import { detectLanguage, persistLanguage } from 't9nkit';

// Detect from multiple sources (first match wins)
const lang = detectLanguage({
  supportedLanguages: ['en', 'es', 'fr'],
  defaultLanguage: 'en',
  sources: ['pathname', 'querystring', 'localStorage', 'cookie', 'navigator', 'htmlLang']
});
// e.g. "es" if URL is /es/about, ?lang=es, or browser is in Spanish

// Save the user's choice for next visit
persistLanguage(lang, { localStorage: true, cookie: true });
```

### Detection Sources

Sources are checked in order. The first match wins:

| Source | Description |
|---|---|
| `pathname` | First URL segment: `/es/about` -> `es` |
| `querystring` | Reads `?lang=` from URL |
| `navigator` | `navigator.languages` / `navigator.language` |
| `htmlLang` | `<html lang="...">` attribute |
| `localStorage` | Reads from `localStorage` (key: `t9nkit-lang`) |
| `cookie` | Reads from `document.cookie` (name: `t9nkit-lang`) |

Default order: `['pathname', 'querystring', 'localStorage', 'cookie', 'navigator', 'htmlLang']`

### Language Matching

The `matchLanguage` helper resolves locale variants:

```typescript
import { matchLanguage } from 't9nkit';

matchLanguage('en-US', ['en', 'es', 'fr']);  // "en" (base match)
matchLanguage('pt', ['pt-BR', 'en']);         // "pt-BR" (prefix match)
matchLanguage('ja', ['en', 'es']);            // null (no match)
```

### Custom Keys

```typescript
const lang = detectLanguage({
  supportedLanguages: ['en', 'es'],
  defaultLanguage: 'en',
  sources: ['localStorage', 'cookie', 'querystring'],
  localStorageKey: 'my-app-lang',
  cookieName: 'my-app-lang',
  queryParam: 'locale'
});
```

## Performance

t9nKit is designed for speed. Benchmarks vs i18next on common operations:

| Operation | t9nKit | i18next | Difference |
|---|---|---|---|
| Simple key lookup | ~30ns | ~800ns | **~26x faster** |
| Variable interpolation | ~50ns | ~1.2μs | **~24x faster** |
| Plural resolution | ~45ns | ~1.5μs | **~33x faster** |
| Nested key (5 levels) | ~40ns | ~900ns | **~22x faster** |
| Initialization (1K keys) | ~0.5ms | ~8ms | **~16x faster** |

Run benchmarks locally:

```bash
bun run bench
```

## Core Features

### Nested Translations

```typescript
const translations = {
  es: {
    nav: { home: "Inicio" }
  }
};

t('nav.home');  // "Inicio"
```

### Variable Interpolation

```typescript
t('welcome', { name: 'Juan' });        // "Bienvenido, Juan!"
t('user.info', { name: 'María', age: 25 }); // "María tiene 25 años"
```

### Pluralization

```typescript
t('items.count', { count: 0 });   // "Sin artículos"
t('items.count', { count: 1 });   // "1 artículo"
t('items.count', { count: 5 });   // "5 artículos"
```

### Formatting

```typescript
tn(1234.56);                      // "1.234,56" (es) or "1,234.56" (en)
td(new Date());                   // "15 de enero de 2026"
tc(1234.56, 'EUR');              // "1.234,56 €"
tr(-1, 'day');                    // "hace 1 día"
```

## API Reference

### `createTranslator(config, lang)`

**Returns:**
- `t(key, params?)` - Translate a key (supports `namespace:key` syntax)
- `tn(number, options?)` - Format number
- `td(date, options?)` - Format date
- `tc(number, currency?)` - Format currency
- `tr(value, unit)` - Format relative time
- `getLanguage()` - Get current language
- `setLanguage(lang)` - Change language
- `hasTranslation(key)` - Check if key exists
- `getTranslation(key)` - Get raw translation
- `addNamespace(name, translations)` - Add a namespace at runtime
- `removeNamespace(name)` - Remove a namespace
- `hasNamespace(name)` - Check if namespace exists
- `getNamespaces()` - List all namespaces
- `loadNamespace(namespace, lang?)` - Lazy-load a namespace
- `loadNamespaces(namespaces, lang?)` - Lazy-load multiple namespaces
- `isNamespaceLoaded(namespace, lang?)` - Check if namespace is loaded
- `registerLoader(namespace, loader)` - Register a lazy loader at runtime

### Configuration

```typescript
const config = {
  translations: {
    en: { /* ... */ },
    es: { /* ... */ }
  },
  defaultLanguage: 'es',
  languages: {              // Optional
    en: 'English',
    es: 'Español'
  },
  warnOnMissing: true,      // Optional (default: true)
  namespaces: {              // Optional - organize translations by namespace
    auth: { en: { /* ... */ }, es: { /* ... */ } }
  },
  defaultNamespace: 'auth',  // Optional - default namespace for keys without ":"
  lazyNamespaces: {          // Optional - load namespaces on demand
    settings: async (lang) => import(`./locales/${lang}/settings.json`)
  }
};
```

## Supported Languages

Built-in locale mappings: `es`, `en`, `fr`, `de`, `pt`, `it`, `ja`, `zh`, `ru`

Any other language code will be passed directly to `Intl` formatters.

## Known Issues

- **Pluralization rules**: Currently only supports basic plural forms (zero/one/other). Languages with complex plural rules (like Russian with 6 forms) will fall back to "other" form.
- **Type safety for translation keys**: Translation keys are not type-checked. Type-safe translations are on the roadmap.
- **Server-side locale detection**: `detectLanguage()` works with browser sources. For server-side detection from `Accept-Language` headers, manual setup is still required.

## Roadmap

### v0.2.0
- [x] Namespace support for organizing large translation files
- [x] Lazy loading of translation bundles
- [x] Browser language detection helper
- [x] Performance benchmarks vs i18next

### v0.3.0
- [ ] Advanced pluralization with CLDR support
- [ ] Translation validation CLI tool
- [ ] VS Code extension for autocomplete

### v1.0.0
- [ ] Type-safe translation keys (template literal types)
- [ ] Backend plugins (load from API/CMS)
- [ ] Migration tools from i18next/react-intl

## License

MIT © [plasenca-d](https://github.com/plasenca-d)

## Links

- [GitHub Repository](https://github.com/plasenca-d/t9nKit)
- [npm Package](https://www.npmjs.com/package/t9nkit)
- [Report Issues](https://github.com/plasenca-d/t9nKit/issues)
