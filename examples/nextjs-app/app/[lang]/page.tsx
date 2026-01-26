/**
 * Home Page - Server Component
 * app/[lang]/page.tsx
 *
 * This is a SERVER COMPONENT that:
 * - Uses createServerTranslator for translations
 * - Can fetch data server-side
 * - Renders Client Components for interactivity
 */

import { createServerTranslator } from "t9nkit/nextjs/server";
import { i18nConfig, type AppLanguage } from "@/i18n-config";
import Counter from "@/components/Counter"; // Client Component
import ProductList from "@/components/ProductList"; // Client Component

interface Props {
  params: {
    lang: AppLanguage;
  };
}

// This component is a SERVER COMPONENT by default
export default async function HomePage({ params }: Props) {
  // Create translator for Server Component
  const { t, td } = createServerTranslator(i18nConfig, params.lang);

  // You can fetch data here (server-side)
  const currentDate = new Date();

  return (
    <div className="home-page">
      {/* Server-rendered translations */}
      <section className="hero">
        <h1>{t("home.title")}</h1>
        <p>{t("home.subtitle")}</p>
        <p>Current date: {td(currentDate, { dateStyle: "long" })}</p>
      </section>

      {/* Server-rendered content */}
      <section className="server-section">
        <h2>{t("home.serverSection")}</h2>
        <p>
          This section is rendered on the server. The translation happens at
          build time or request time.
        </p>
        <p>Language: {params.lang}</p>
      </section>

      {/* Client Components for interactivity */}
      <section className="client-section">
        <h2>{t("home.clientSection")}</h2>

        {/* Counter - Client Component with translations */}
        <Counter />

        {/* ProductList - Client Component with translations */}
        <ProductList />
      </section>
    </div>
  );
}

/**
 * Optional: Generate metadata
 */
export async function generateMetadata({ params }: Props) {
  const { t } = createServerTranslator(i18nConfig, params.lang);

  return {
    title: t("metadata.home.title"),
    description: t("metadata.home.description"),
  };
}
