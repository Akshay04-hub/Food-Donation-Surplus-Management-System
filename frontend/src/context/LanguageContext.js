import React, { createContext, useState, useEffect } from 'react';
import translations from '../utils/translations';

// Create the context
export const LanguageContext = createContext();

// Language Provider Component
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get saved language from localStorage or default to English
    const savedLanguage = localStorage.getItem('selectedLanguage');
    return savedLanguage || 'en';
  });

  // Update localStorage when language changes
  useEffect(() => {
    localStorage.setItem('selectedLanguage', language);
    // Set HTML lang attribute for accessibility
    document.documentElement.lang = language;
    // Set text direction (Telugu and Hindi are LTR, English is LTR)
    document.documentElement.dir = 'ltr';
  }, [language]);

  // Function to get translated text
  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  const value = {
    language,
    setLanguage,
    t,
    availableLanguages: [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
    ],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use language context
export const useLanguage = () => {
  const context = React.useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export default LanguageContext;
