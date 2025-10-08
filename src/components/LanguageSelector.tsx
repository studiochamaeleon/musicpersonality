'use client';

import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import { Language } from '@/types/i18n';

interface LanguageSelectorProps {
  className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  className = "" 
}) => {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  return (
    <div className={`language-selector ${className}`}>
      <div className="flex items-center gap-1 sm:gap-2 text-white/90 mb-2 sm:mb-4">
        <Languages size={16} className="sm:w-5 sm:h-5" />
        <span className="text-xs sm:text-sm font-medium hidden sm:inline">{t('languageSelector.label')}</span>
      </div>
      
      <div className="flex gap-1 sm:gap-2">
        {languages.map(({ code, name, flag }) => (
          <button
            key={code}
            onClick={() => setLanguage(code)}
            className={`
              flex items-center gap-1 sm:gap-2 px-2 py-2 sm:px-4 sm:py-3 rounded-lg font-medium transition-all transform hover:scale-105 text-sm sm:text-base
              ${language === code 
                ? 'bg-white text-purple-600 shadow-lg' 
                : 'bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30'
              }
            `}
          >
            <span className="text-base sm:text-lg">{flag}</span>
            <span className="hidden sm:inline">{name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;