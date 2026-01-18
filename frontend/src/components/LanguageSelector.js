import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import './LanguageSelector.css';

const LanguageSelector = () => {
  const { language, setLanguage, availableLanguages, t } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);

  const currentLanguage = availableLanguages.find(lang => lang.code === language);

  return (
    <div className="language-selector">
      <button
        className="language-button"
        onClick={() => setIsOpen(!isOpen)}
        title={t('language')}
        aria-label={`${t('language')}: ${currentLanguage?.nativeName}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="language-icon">🌐</span>
        <span className="language-text">{currentLanguage?.nativeName}</span>
        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="language-dropdown" role="menu">
          {availableLanguages.map((lang) => (
            <button
              key={lang.code}
              className={`language-option ${language === lang.code ? 'active' : ''}`}
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              role="menuitem"
              aria-current={language === lang.code ? 'true' : 'false'}
            >
              <span className="flag">{['en', 'te', 'hi'].indexOf(lang.code) === 0 ? '🇬🇧' : lang.code === 'te' ? '🟡' : '🟠'}</span>
              <span className="lang-name">{lang.nativeName}</span>
              {language === lang.code && <span className="checkmark">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
