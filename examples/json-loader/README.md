# JSON Loader Example

Load translations from JSON objects (or `.json` files) using `loadJsonTranslations`.

## Running it

```bash
bun run examples/json-loader/index.ts
```

## What it shows

- Loading simple key-value translations
- Interpolation with `{variable}` placeholders
- Pluralization with `{ zero, one, other }` objects
- Nested translations accessed via dot notation (`nav.settings.profile`)
- Switching languages at runtime
- Simulating real JSON file imports with multiple languages

## JSON format

```json
{
  "greeting": "Hello, {name}!",
  "items": {
    "zero": "No items",
    "one": "1 item",
    "other": "{count} items"
  },
  "nav": {
    "home": "Home",
    "settings": {
      "profile": "Profile"
    }
  }
}
```

The loader automatically detects plural objects (objects with `one` + `other` keys) vs nested translation groups.
