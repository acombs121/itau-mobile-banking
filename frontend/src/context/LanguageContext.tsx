import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { translations, Language } from '../i18n/translations';
import { useBrand, templatizeBrandObject } from './BrandContext';

interface LanguageContextType {
  lang: Language;
  t: typeof translations['pt'];
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  brandText: (text: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeBrand, templatize } = useBrand();

  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('itau_lang');
    return (saved === 'en' || saved === 'pt') ? saved : 'pt';
  });

  useEffect(() => {
    localStorage.setItem('itau_lang', lang);
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
  }, [lang]);

  const toggleLang = () => {
    setLang(prev => (prev === 'pt' ? 'en' : 'pt'));
  };

  const rawT = translations[lang];

  // Dynamically substitute any brand mentions in locale translations
  const t = useMemo(() => {
    return templatizeBrandObject(rawT, activeBrand);
  }, [rawT, activeBrand]);

  const brandText = (text: string) => templatize(text);

  return (
    <LanguageContext.Provider value={{ lang, t, setLang, toggleLang, brandText }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
