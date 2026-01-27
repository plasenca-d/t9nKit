/**
 * Root Layout for Next.js App Router
 * app/[lang]/layout.tsx
 *
 * This is a SERVER COMPONENT that:
 * - Receives language from URL params
 * - Provides translation context to all children
 * - Handles metadata generation
 */

import { supportedLanguages, type AppLanguage } from "@/i18n-config";
import Providers from "@/components/Providers";
import type { Metadata } from "next";
import Navigation from "@/components/Navigation";

interface Props {
  children: React.ReactNode;
  params: {
    lang: AppLanguage;
  };
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = params;

  // You can use createServerTranslator here if needed
  // const { t } = createServerTranslator(i18nConfig, lang);

  return {
    title: {
      template: "%s | My App",
      default: "My App",
    },
    description: "Next.js app with t9nKit",
    alternates: {
      languages: {
        es: `/es`,
        en: `/en`,
        "x-default": `/es`,
      },
    },
  };
}

/**
 * Generate static params for all supported languages
 * This enables static generation at build time
 */
export async function generateStaticParams() {
  return supportedLanguages.map((lang) => ({
    lang,
  }));
}

export default function RootLayout({ children, params }: Props) {
  const { lang } = params;

  return (
    <html lang={lang}>
      <body>
        {/*
          NextTranslationProvider makes translations available to:
          - Client Components via useNextTranslation()
          - Server Components via createServerTranslator()
        */}
        <Providers language={lang}>
          <Navigation />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
