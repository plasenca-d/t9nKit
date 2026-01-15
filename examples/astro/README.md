# Astro Example

Shows URL-based routing (`/es/about`, `/en/about`) and SEO setup.

## Running

```bash
cd examples/astro
bun install
bun run dev
```

Then visit `/es/` or `/en/`.

## Main patterns

**Get language from URL:**
```astro
---
import { getLangFromUrl } from 't9nkit/astro';
const lang = getLangFromUrl(Astro.url, ['es', 'en'], 'es');
---
```

**Use translations:**
```astro
---
const { t } = useTranslations(config, lang);
---
<h1>{t('title')}</h1>
```

## Files

- `i18n-setup.ts` - Main config with helper functions
- `complete-example.astro` - Everything in one file (useful reference)
- `layouts/BaseLayout.astro` - Reusable layout that handles i18n
- `components/LanguageSwitcher.astro` - Generates links to other languages

The `generateAlternateLinks()` helper is for SEO - it creates those `<link rel="alternate">` tags that search engines like.
