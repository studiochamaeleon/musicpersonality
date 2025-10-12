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
      '음악 성격 테스트 | 음악 취향 분석으로 나만의 MUSIC 성향 찾기'
    );

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', getLocalizedText(
        'Take our comprehensive music personality assessment based on the MUSIC model. Discover your unique musical preferences, get personalized genre recommendations, and explore new artists tailored to your personality.',
        '무료 음악 성격 테스트로 나의 음악 취향을 분석해보세요! MUSIC 모델 기반의 심리 테스트로 개인 맞춤 장르 추천과 음악 성향 분석을 받아보실 수 있습니다. 5분만에 완료 가능한 음악 MBTI 테스트.'
      ));
    }

    // Update Open Graph title
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', getLocalizedText(
        'Music Personality Test - Discover Your Musical Identity',
        '음악 성격 테스트 | 음악 취향 분석으로 나만의 MUSIC 성향 찾기'
      ));
    }

    // Update Open Graph description
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', getLocalizedText(
        'Take our comprehensive music personality assessment and discover your unique musical preferences with personalized recommendations.',
        '무료 음악 성격 테스트로 나의 음악 취향 분석! MUSIC 모델 기반 심리 테스트로 개인 맞춤 장르 추천을 받아보세요.'
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
        '음악 성격 테스트 | 음악 취향 분석으로 나만의 MUSIC 성향 찾기'
      ));
    }

    // Update Twitter description
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute('content', getLocalizedText(
        'Take our comprehensive music personality assessment and discover your unique musical preferences with personalized recommendations.',
        '무료 음악 성격 테스트로 나의 음악 취향 분석! MUSIC 모델 기반 심리 테스트로 개인 맞춤 장르 추천을 받아보세요.'
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