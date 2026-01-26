/**
 * Next.js Utilities for t9nKit
 *
 * Re-exports from client and server modules.
 * For Server Components, import from 't9nkit/nextjs/server' to avoid
 * pulling in client-only React APIs (createContext, hooks).
 *
 * @module t9nkit/nextjs
 */

export { NextTranslationProvider, useNextTranslation } from "./nextjs-client";

export {
  createServerTranslator,
  getLanguageFromRequest,
  generateLanguageAlternates,
} from "./nextjs-server";
