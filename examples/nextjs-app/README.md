# Next.js App Router Example

Works with Next.js 13+ App Router. Has both Server and Client Components.

## Running

```bash
cd examples/nextjs-app
bun install
bun run dev
```

Visit `http://localhost:3000` and it'll redirect based on your browser language. Or go directly to `/es` or `/en`.

## How it's set up

**Middleware** (`middleware.ts`) - Checks your browser language and redirects you to the right URL. Saves preference in a cookie.

**Server Components** - Use `createServerTranslator()`:
```tsx
const { t } = createServerTranslator(config, params.lang);
```

**Client Components** - Use the hook:
```tsx
'use client';
const { t } = useNextTranslation();
```

## Structure

```
app/[lang]/
  layout.tsx    <- Provider goes here
  page.tsx      <- Server Component
  
components/
  Navigation.tsx  <- Client (has state)
  Counter.tsx     <- Client (interactive)
```

The `[lang]` dynamic route handles both `/es/*` and `/en/*` URLs.

## Static generation

The `generateStaticParams()` function pre-builds pages for both languages at build time. Good for performance.

Check out `middleware.ts` to see how language detection works. It's pretty straightforward - cookie first, then browser header, then default.
