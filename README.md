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
- `t(key, params?)` - Translate a key
- `tn(number, options?)` - Format number
- `td(date, options?)` - Format date
- `tc(number, currency?)` - Format currency
- `tr(value, unit)` - Format relative time
- `getLanguage()` - Get current language
- `setLanguage(lang)` - Change language
- `hasTranslation(key)` - Check if key exists
- `getTranslation(key)` - Get raw translation

### Configuration

```typescript
const config = {
  translations: {
    en: { /* ... */ },
    es: { /* ... */ }
  },
  defaultLanguage: 'es',
  languages: {        // Optional
    en: 'English',
    es: 'Español'
  },
  warnOnMissing: true // Optional (default: true)
};
```

## Supported Languages

Built-in locale mappings: `es`, `en`, `fr`, `de`, `pt`, `it`, `ja`, `zh`, `ru`

Any other language code will be passed directly to `Intl` formatters.

## Known Issues

- **Pluralization rules**: Currently only supports basic plural forms (zero/one/other). Languages with complex plural rules (like Russian with 6 forms) will fall back to "other" form.
- **Type safety for translation keys**: Translation keys are not type-checked. Type-safe translations are on the roadmap.
- **Server-side locale detection**: Automatic locale detection from `Accept-Language` headers requires manual setup.

## Roadmap

### v0.2.0
- [ ] Namespace support for organizing large translation files
- [ ] Lazy loading of translation bundles
- [ ] Browser language detection helper
- [ ] Performance benchmarks vs i18next

### v0.3.0
- [ ] Advanced pluralization with CLDR support
- [ ] ICU MessageFormat syntax support
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
