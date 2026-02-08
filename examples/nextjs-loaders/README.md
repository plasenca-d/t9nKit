# Next.js App Router + JSON Loader Example

Same as `nextjs-app/` but uses `loadJsonTranslations` instead of hand-building the config object.

## Running

```bash
cd examples/nextjs-loaders
bun install
bun run dev
```

Visit `http://localhost:3000` — middleware redirects based on your browser language. Or go to `/es` or `/en` directly.

## Key difference from `nextjs-app/`

The only change is in `i18n-config.ts`. Instead of manually constructing a `T9nKitConfig`:

```typescript
// Before (manual config)
export const i18nConfig: T9nKitConfig<AppLanguage> = {
  translations,
  defaultLanguage,
  languages: languageNames,
};
```

You use the loader:

```typescript
// After (JSON loader)
import { loadJsonTranslations } from 't9nkit/loaders';

export const i18nConfig = loadJsonTranslations(
  { en, es },
  { defaultLanguage, languages: languageNames },
);
```

Everything else stays the same — `createServerTranslator`, `useNextTranslation`, the provider, middleware — all unchanged.

## What it shows

- `loadJsonTranslations` with nested objects, plurals (`{ zero, one, other }`), and interpolation
- Server Components using `createServerTranslator(config, lang)`
- Client Components using `useNextTranslation()` hook
- Pluralization in both server and client contexts
- Currency formatting with `tc()`
- Date formatting with `td()`
- Middleware for language detection and redirects

## Structure

```
i18n-config.ts          <- loadJsonTranslations config
proxy.ts                <- Middleware for language detection
components/
  Providers.tsx         <- Client wrapper with NextTranslationProvider
  Navigation.tsx        <- Client Component (hook + language switcher)
  ProductList.tsx       <- Client Component (hook + currency formatting)
app/[lang]/
  layout.tsx            <- Server layout (provider + static params)
  page.tsx              <- Server page (createServerTranslator)
```
