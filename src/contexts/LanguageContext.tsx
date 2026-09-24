'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isLanguage, Language } from '@/types/i18n';
import { readBrowserStorage, writeBrowserStorage } from '@/lib/browserStorage';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isLanguageSelected: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

function browserLanguage(): Language {
  const locale = navigator.languages?.[0] || navigator.language;
  const primary = locale?.toLowerCase().split(/[-_]/)[0];
  return isLanguage(primary) ? primary : 'ko';
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('ko');
  const [isLanguageSelected, setIsLanguageSelected] = useState(false);

  // Shared links take precedence, followed by an explicit choice, then the browser locale.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const queryLanguage = new URLSearchParams(window.location.search).get('lang');
      const savedLanguage = readBrowserStorage('local', 'music-personality-language');
      const hasSelectedLanguage = readBrowserStorage('local', 'music-personality-language-selected');

      if (isLanguage(queryLanguage)) {
        setLanguageState(queryLanguage);
      } else if (isLanguage(savedLanguage)) {
        setLanguageState(savedLanguage);
      } else {
        setLanguageState(browserLanguage());
      }

      if (hasSelectedLanguage === 'true') {
        setIsLanguageSelected(true);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setIsLanguageSelected(true);
    
    if (typeof window !== 'undefined') {
      writeBrowserStorage('local', 'music-personality-language', lang);
      writeBrowserStorage('local', 'music-personality-language-selected', 'true');
      const url = new URL(window.location.href);
      if (lang === 'ko') url.searchParams.delete('lang');
      else url.searchParams.set('lang', lang);
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    }
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      isLanguageSelected 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
