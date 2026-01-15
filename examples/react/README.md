# React Example

Shopping cart demo with language switcher. Uses React Context to share translations.

## Setup

```bash
cd examples/react
bun install
bun run dev
```

## How it works

Wrap your app in `TranslationProvider`, then use the `useTranslation()` hook anywhere:

```tsx
const { t, setLanguage } = useTranslation();
```

The language preference gets saved to localStorage.

## Files to check out

- `App.tsx` - Sets up the provider
- `i18n-config.ts` - Translation definitions and helpers
- `components/Cart.tsx` - Shows pluralization ("1 item" vs "5 items")
- `components/LanguageSwitcher.tsx` - How to switch languages

Pretty standard React Context pattern, nothing fancy.
