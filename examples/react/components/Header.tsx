/**
 * Header Component
 * 
 * Shows how to use the useTranslation hook in a component
 */

import { useTranslation } from '../../../src/react';

export default function Header() {
  const { t } = useTranslation();

  return (
    <header className="header">
      <div className="container">
        <h1 className="logo">{t('app.name')}</h1>
        
        <nav className="nav">
          <a href="#home">{t('nav.home')}</a>
          <a href="#about">{t('nav.about')}</a>
          <a href="#products">{t('nav.products')}</a>
          <a href="#contact">{t('nav.contact')}</a>
        </nav>
      </div>
    </header>
  );
}
