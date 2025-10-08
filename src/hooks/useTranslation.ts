import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { TranslationKeys } from '@/types/i18n';
import { loadTranslations, getNestedValue } from '@/locales';

export const useTranslation = () => {
  const { language } = useLanguage();
  const [translations, setTranslations] = useState<TranslationKeys | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLanguageData = async () => {
      setIsLoading(true);
      try {
        const translationData = await loadTranslations(language);
        setTranslations(translationData);
      } catch (error) {
        console.error('Failed to load translations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguageData();
  }, [language]);

  const t = (key: string, params?: Record<string, string | number>, fallback?: string): string => {
    if (!translations) {
      return fallback || key;
    }

    const value = getNestedValue(translations, key);
    let result = typeof value === 'string' ? value : (fallback || key);
    
    // Handle variable interpolation
    if (params && typeof result === 'string') {
      Object.keys(params).forEach(paramKey => {
        const placeholder = `{${paramKey}}`;
        result = result.replace(new RegExp(placeholder, 'g'), String(params[paramKey]));
      });
    }
    
    return result;
  };

  return {
    t,
    language,
    isLoading,
    translations
  };
};