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
    { code: 'ja', name: 'JA' },
  ];

  return (
    <div className={`inline-flex shrink-0 rounded-full border border-white/15 bg-[#101115]/75 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,.04)] backdrop-blur-xl ${className}`}>
      {languages.map(({ code, name }) => (
        <button
          key={code}
          onClick={() => setLanguage(code)}
          aria-pressed={language === code}
          aria-label={code === 'ko' ? '한국어로 보기' : code === 'ja' ? '日本語で表示' : 'View in English'}
          className={`min-h-11 min-w-11 shrink-0 whitespace-nowrap rounded-full px-2 text-[11px] font-bold tracking-[0.1em] transition-[background-color,color,box-shadow] active:scale-95 ${
            language === code ? 'bg-white text-black shadow-sm' : 'text-white/70 hover:bg-white/5 hover:text-white'
          }`}
        >
          {name}
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;
