'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function DynamicStructuredData() {
  const { language } = useLanguage();

  useEffect(() => {
    // Remove existing structured data
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach(script => {
      if (script.textContent?.includes('Music Personality Test') || script.textContent?.includes('음악 성격 테스트')) {
        script.remove();
      }
    });

    // Add new structured data for current language
    const getLocalizedText = (enText: string, koText: string) => {
      return language === 'ko' ? koText : enText;
    };

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "url": "https://musicpersonalitytest.pages.dev",
      "name": getLocalizedText('Music Personality Test', '음악 성격 테스트'),
      "description": getLocalizedText(
        'Comprehensive music personality assessment based on the MUSIC model',
        'MUSIC 모델 기반 포괄적인 음악 성격 평가'
      ),
      "publisher": {
        "@type": "Organization",
        "name": getLocalizedText('Music Personality Research', '음악 성격 연구소'),
        "url": "https://musicpersonalitytest.pages.dev"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://musicpersonalitytest.pages.dev/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

  }, [language]);

  return null;
}