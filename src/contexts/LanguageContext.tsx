'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language } from '@/types/i18n';

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
      const savedLanguage = localStorage.getItem('music-personality-language') as Language;
      const hasSelectedLanguage = localStorage.getItem('music-personality-language-selected');
      
      if (savedLanguage && (savedLanguage === 'ko' || savedLanguage === 'en')) {
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
      localStorage.setItem('music-personality-language', lang);
      localStorage.setItem('music-personality-language-selected', 'true');
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