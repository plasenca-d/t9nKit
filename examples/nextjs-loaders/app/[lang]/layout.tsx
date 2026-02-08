/**
 * Root Layout - Server Component
 * Receives language from URL params and wraps children with the translation provider.
 */

import { supportedLanguages, type AppLanguage } from "@/i18n-config";
import Providers from "@/components/Providers";
import Navigation from "@/components/Navigation";
import type { Metadata } from "next";

interface Props {
  children: React.ReactNode;
  params: { lang: AppLanguage };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: {
      template: "%s | My App",
      default: "My App",
    },
    alternates: {
      languages: {
        en: "/en",
        es: "/es",
        "x-default": "/es",
      },
    },
  };
}

export async function generateStaticParams() {
  return supportedLanguages.map((lang) => ({ lang }));
}

export default function RootLayout({ children, params }: Props) {
  const { lang } = params;

  return (
    <html lang={lang}>
      <body>
        <Providers language={lang}>
          <Navigation />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
