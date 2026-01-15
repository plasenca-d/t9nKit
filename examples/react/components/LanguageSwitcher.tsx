/**
 * Language Switcher Component
 * 
 * Shows:
 * - Reactive language switching
 * - Getting current language from context
 * - Saving to localStorage
 */

import { useTranslation } from '../../../src/react';
import { saveLanguage, type AppLanguage, i18nConfig } from '../i18n-config';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();

  const handleLanguageChange = (newLang: AppLanguage) => {
    setLanguage(newLang);
    saveLanguage(newLang); // Persist to localStorage
  };

  const languages = i18nConfig.languages || {};

  return (
    <div className="language-switcher">
      <span className="language-label">🌍</span>
      
      <div className="language-buttons">
        {Object.entries(languages).map(([code, name]) => (
          <button
            key={code}
            onClick={() => handleLanguageChange(code as AppLanguage)}
            className={`lang-button ${language === code ? 'active' : ''}`}
            aria-label={`Switch to ${name}`}
          >
            {name}
          </button>
        ))}
      </div>
      
      <span className="current-language">
        Current: {languages[language]}
      </span>
    </div>
  );
}
