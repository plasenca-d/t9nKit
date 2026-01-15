/**
 * Hero Component
 * 
 * Shows basic translation usage
 */

import { useTranslation } from '../../../src/react';

export default function Hero() {
  const { t } = useTranslation();

  return (
    <section className="hero">
      <div className="container">
        <h1 className="hero-title">{t('hero.title')}</h1>
        <p className="hero-subtitle">{t('hero.subtitle')}</p>
        <button className="hero-cta">{t('hero.cta')}</button>
      </div>
    </section>
  );
}
