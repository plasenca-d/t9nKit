# Basic Example

No frameworks, just TypeScript showing the core API.

## Running it

```bash
bun run examples/basic/index.ts
```

## What it shows

- Two ways to use the library: functional (`createTranslator`) and class-based (`T9nKit`)
- Interpolation, plurals, nested keys
- Formatting numbers, dates, currency
- Error handling (missing keys, wrong params, etc.)

The functional API is usually what you want. The class-based one is there if you need more control.

## Output

You'll see translations in Spanish and English with all the different features. Play around with it.
