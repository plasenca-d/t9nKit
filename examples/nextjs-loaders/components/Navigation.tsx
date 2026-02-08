"use client";

import { useNextTranslation } from "t9nkit/nextjs/client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { supportedLanguages, languageNames } from "@/i18n-config";

export default function Navigation() {
  const { t, language } = useNextTranslation();
  const pathname = usePathname();

  const pathWithoutLang =
    pathname.replace(new RegExp(`^/${language}`), "") || "/";

  return (
    <nav className="navigation">
      <div className="nav-links">
        <Link
          href={`/${language}/`}
          className={pathWithoutLang === "/" ? "active" : ""}
        >
          {t("nav.home")}
        </Link>

        <Link
          href={`/${language}/products`}
          className={pathWithoutLang.startsWith("/products") ? "active" : ""}
        >
          {t("nav.products")}
        </Link>

        <Link
          href={`/${language}/blog`}
          className={pathWithoutLang.startsWith("/blog") ? "active" : ""}
        >
          {t("nav.blog")}
        </Link>

        <Link
          href={`/${language}/contact`}
          className={pathWithoutLang.startsWith("/contact") ? "active" : ""}
        >
          {t("nav.contact")}
        </Link>
      </div>

      {/* Language Switcher */}
      <div className="language-switcher">
        {supportedLanguages.map((lang) => (
          <Link
            key={lang}
            href={`/${lang}${pathWithoutLang}`}
            className={lang === language ? "active" : ""}
          >
            {languageNames[lang]}
          </Link>
        ))}
      </div>
    </nav>
  );
}
