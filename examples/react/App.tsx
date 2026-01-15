/**
 * React App with t9nKit
 * 
 * This shows how to set up the TranslationProvider at the root level
 * and use translations throughout your app
 */

import { useState, useEffect } from 'react';
import { TranslationProvider } from '../../src/react';
import { 
  i18nConfig, 
  getInitialLanguage, 
  saveLanguage,
  type AppLanguage 
} from './i18n-config';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import LanguageSwitcher from './components/LanguageSwitcher';

/**
 * Main App Component
 */
export default function App() {
  // Get initial language (from localStorage or browser)
  const [language, setLanguage] = useState<AppLanguage>(getInitialLanguage());

  // Save language when it changes
  useEffect(() => {
    saveLanguage(language);
  }, [language]);

  return (
    <TranslationProvider 
      config={i18nConfig} 
      defaultLanguage={language}
    >
      <div className="app">
        <Header />
        
        <div className="language-switcher-container">
          <LanguageSwitcher />
        </div>
        
        <Hero />
        
        <main className="main-content">
          <ProductList />
          <Cart />
        </main>
      </div>
    </TranslationProvider>
  );
}
