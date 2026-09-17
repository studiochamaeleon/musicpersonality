'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/types/i18n';

interface LanguageSelectorProps {
  className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className = '' }) => {
  const { language, setLanguage } = useLanguage();
  const languages: { code: Language; name: string }[] = [
    { code: 'ko', name: 'KO' },
    { code: 'en', name: 'EN' },
  ];

  return (
    <div className={`inline-flex rounded-full border border-white/10 bg-white/[0.045] p-1 backdrop-blur-xl ${className}`}>
      {languages.map(({ code, name }) => (
        <button
          key={code}
          onClick={() => setLanguage(code)}
          aria-pressed={language === code}
          aria-label={code === 'ko' ? '한국어로 보기' : 'View in English'}
          className={`min-h-9 min-w-10 rounded-full px-3 text-[11px] font-bold tracking-[0.14em] transition-colors ${
            language === code ? 'bg-white text-black' : 'text-white/55 hover:text-white'
          }`}
        >
          {name}
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;
