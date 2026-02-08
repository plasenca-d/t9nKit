"use client";

import { NextTranslationProvider } from "t9nkit/nextjs/client";
import { i18nConfig, type AppLanguage } from "@/i18n-config";

export default function Providers({
  children,
  language,
}: {
  children: React.ReactNode;
  language: AppLanguage;
}) {
  return (
    <NextTranslationProvider config={i18nConfig} language={language}>
      {children}
    </NextTranslationProvider>
  );
}
