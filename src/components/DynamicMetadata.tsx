'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function DynamicMetadata() {
  const { language } = useLanguage();

  useEffect(() => {
    const getLocalizedText = (enText: string, koText: string) => {
      return language === 'ko' ? koText : enText;
    };

    // Update document title
    document.title = getLocalizedText(
      'Music Personality Test - Discover Your Musical Identity',
      '음악 성격 테스트 - 나만의 음악적 정체성 발견하기'
    );

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', getLocalizedText(
        'Take our comprehensive music personality assessment based on the MUSIC model. Discover your unique musical preferences, get personalized genre recommendations, and explore new artists tailored to your personality.',
        'MUSIC 모델을 기반으로 한 포괄적인 음악 성격 평가를 받아보세요. 고유한 음악적 선호도를 발견하고, 개인 맞춤형 장르 추천과 성격에 맞는 새로운 아티스트를 탐색해보세요.'
      ));
    }

    // Update Open Graph title
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', getLocalizedText(
        'Music Personality Test - Discover Your Musical Identity',
        '음악 성격 테스트 - 나만의 음악적 정체성 발견하기'
      ));
    }

    // Update Open Graph description
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', getLocalizedText(
        'Take our comprehensive music personality assessment and discover your unique musical preferences with personalized recommendations.',
        '포괄적인 음악 성격 평가를 통해 고유한 음악적 선호도를 발견하고 개인 맞춤형 추천을 받아보세요.'
      ));
    }

    // Update Open Graph site name
    const ogSiteName = document.querySelector('meta[property="og:site_name"]');
    if (ogSiteName) {
      ogSiteName.setAttribute('content', getLocalizedText(
        'Music Personality Test',
        '음악 성격 테스트'
      ));
    }

    // Update Twitter title
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', getLocalizedText(
        'Music Personality Test - Discover Your Musical Identity',
        '음악 성격 테스트 - 나만의 음악적 정체성 발견하기'
      ));
    }

    // Update Twitter description
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute('content', getLocalizedText(
        'Take our comprehensive music personality assessment and discover your unique musical preferences with personalized recommendations.',
        '포괄적인 음악 성격 평가를 통해 고유한 음악적 선호도를 발견하고 개인 맞춤형 추천을 받아보세요.'
      ));
    }

    // Update Open Graph locale
    const ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) {
      ogLocale.setAttribute('content', language === 'ko' ? 'ko_KR' : 'en_US');
    }

  }, [language]);

  return null;
}