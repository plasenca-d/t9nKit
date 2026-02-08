# Examples

Quick examples showing how to use t9nKit in different setups.

## What's here

### `basic/` - No framework, just the API
Run with `bun run examples/basic/index.ts`

Good starting point to understand the core features.

### `json-loader/` - Load translations from JSON
Run with `bun run examples/json-loader/index.ts`

Shows how to use `loadJsonTranslations` with nested objects, plurals, and interpolation.

### `react/` - React with Context API
Shopping cart example with language switcher. Shows how to use the Provider pattern.

### `astro/` - SSR/SSG with URL routing
Language in the URL (`/es/page`, `/en/page`) and SEO stuff like hreflang tags.

### `nextjs-app/` - Next.js App Router
Server + Client Components, middleware for auto-detection, all that good stuff.

### `nextjs-loaders/` - Next.js App Router + JSON Loader
Same as `nextjs-app/` but uses `loadJsonTranslations` for the config instead of building it manually.

## Running the examples

Each folder has its own setup. Usually:

```bash
cd examples/[folder]
bun install    # if needed
bun run dev    # or just run the .ts file
```

Check each folder for specifics.
