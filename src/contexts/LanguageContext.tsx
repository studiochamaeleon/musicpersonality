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

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('ko');
  const [isLanguageSelected, setIsLanguageSelected] = useState(false);

  // 컴포넌트 마운트 시 저장된 언어 설정 불러오기
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const queryLanguage = new URLSearchParams(window.location.search).get('lang') as Language;
      const savedLanguage = readBrowserStorage('local', 'music-personality-language') as Language;
      const hasSelectedLanguage = readBrowserStorage('local', 'music-personality-language-selected');
      
      if (isLanguage(queryLanguage)) {
        setLanguageState(queryLanguage);
      } else if (isLanguage(savedLanguage)) {
        setLanguageState(savedLanguage);
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
