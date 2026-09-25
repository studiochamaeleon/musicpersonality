import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { TranslationKeys } from '@/types/i18n';
import { loadTranslations, getNestedValue } from '@/locales';
import koreanTranslations from '@/locales/ko.json';

export const useTranslation = () => {
  const { language } = useLanguage();
  // Render the default-language copy in the exported HTML, before hydration.
  const [translations, setTranslations] = useState<TranslationKeys>(koreanTranslations);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (language === 'ko') {
      setTranslations(koreanTranslations);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const loadLanguageData = async () => {
      setIsLoading(true);
      try {
        const translationData = await loadTranslations(language);
        if (!cancelled) setTranslations(translationData);
      } catch (error) {
        console.error('Failed to load translations:', error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void loadLanguageData();
    return () => { cancelled = true; };
  }, [language]);

  const t = (key: string, params?: Record<string, string | number>, fallback?: string): string => {
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

  const getArray = (key: string): string[] => {
    const value = key.split('.').reduce<unknown>((current, segment) => {
      if (!current || typeof current !== 'object') return undefined;
      return (current as Record<string, unknown>)[segment];
    }, translations);

    return Array.isArray(value) && value.every(item => typeof item === 'string') ? value : [];
  };

  return {
    t,
    getArray,
    language,
    isLoading,
    translations
  };
};
