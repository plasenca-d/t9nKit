/**
 * Home Page - Server Component
 * Uses createServerTranslator with the loader-generated config.
 */

import { createServerTranslator } from "t9nkit/nextjs/server";
import { i18nConfig, type AppLanguage } from "@/i18n-config";
import ProductList from "@/components/ProductList";

interface Props {
  params: { lang: AppLanguage };
}

export default async function HomePage({ params }: Props) {
  const { t, td } = createServerTranslator(i18nConfig, params.lang);

  return (
    <div className="home-page">
      {/* Server-rendered translations (from JSON loader) */}
      <section className="hero">
        <h1>{t("home.title")}</h1>
        <p>{t("home.subtitle")}</p>
        <p>{td(new Date(), { dateStyle: "long" })}</p>
      </section>

      <section className="server-section">
        <h2>{t("home.serverSection")}</h2>
        <p>
          This section is server-rendered. The translations come from
          loadJsonTranslations — same config, zero extra setup.
        </p>

        {/* Nested translations via dot notation */}
        <p>{t("blog.publishedAt", { date: td(new Date(), { dateStyle: "medium" }) })}</p>
        <p>{t("blog.author", { name: "Alice" })}</p>

        {/* Pluralization loaded from JSON */}
        <p>{t("blog.comments", { count: 0 })}</p>
        <p>{t("blog.comments", { count: 1 })}</p>
        <p>{t("blog.comments", { count: 12 })}</p>
      </section>

      {/* Client Component with translations */}
      <section className="client-section">
        <h2>{t("home.clientSection")}</h2>
        <ProductList />
      </section>
    </div>
  );
}

export async function generateMetadata({ params }: Props) {
  const { t } = createServerTranslator(i18nConfig, params.lang);

  return {
    title: t("metadata.home.title"),
    description: t("metadata.home.description"),
  };
}
